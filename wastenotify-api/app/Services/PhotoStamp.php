<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

/**
 * Burns the report's own facts onto the photo: coordinates, place, reporter
 * and time.
 *
 * The point is that the image carries its own provenance. A photo that
 * travels — downloaded by an officer, forwarded to a collector, pasted into a
 * compliance report, printed — leaves the database behind, and with it every
 * column that said where and when it was taken. Stamped, it still answers
 * those questions wherever it ends up.
 *
 * Drawn with GD rather than an image library, because GD plus FreeType is
 * already present on both the XAMPP box and the Ubuntu server and adding a
 * Composer dependency for four lines of text is not a good trade.
 */
class PhotoStamp
{
    /**
     * Fonts to try, in order.
     *
     * No font is bundled with the repository. Each of these ships with the
     * operating system it belongs to — DejaVu with Ubuntu (`fonts-dejavu-core`,
     * in the base image), Arial with Windows — so the stamp renders on the
     * server and on a developer's machine without carrying a binary in git or
     * fetching one at deploy time.
     */
    private const FONT_CANDIDATES = [
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
        'C:/Windows/Fonts/arialbd.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        'C:/Windows/Fonts/arial.ttf',
    ];

    /**
     * @param  array{reference: string, latitude: float, longitude: float, address: string, reporter: string, taken_at: \DateTimeInterface}  $facts
     * @return bool  Whether the image was stamped.
     */
    public function apply(string $absolutePath, array $facts): bool
    {
        $font = $this->font();

        if (! $font) {
            // Better to keep an unstamped photo than to render the panel in
            // GD's built-in bitmap font, which is unreadable at photo size.
            Log::warning('Photo stamp skipped: no usable TrueType font found.', [
                'tried' => self::FONT_CANDIDATES,
            ]);

            return false;
        }

        $image = $this->load($absolutePath);

        if (! $image) {
            return false;
        }

        try {
            $this->draw($image, $font, $facts);

            // 88: the photo has already been through the phone's own JPEG
            // encoder, so this is a second generation. High enough that the
            // re-encode is not what anyone notices.
            imagejpeg($image, $absolutePath, 88);

            return true;
        } finally {
            imagedestroy($image);
        }
    }

    private function draw(\GdImage $image, string $font, array $facts): void
    {
        $w = imagesx($image);
        $h = imagesy($image);

        /*
         * Everything scales off the image width, so the panel occupies the
         * same proportion of a 4000px phone photo as of a 800px one. A fixed
         * point size would be a caption on one and unreadable on the other.
         */
        $size = max(11, (int) round($w * 0.021));
        $pad = (int) round($size * 0.85);
        $lineGap = (int) round($size * 0.52);
        $lineH = $size + $lineGap;

        $lines = $this->lines($facts);
        $panelH = count($lines) * $lineH + $pad * 2 - $lineGap;
        $panelY = $h - $panelH;

        // Translucent black rather than opaque: the bottom of a waste photo is
        // often the pile itself, and covering it outright would hide the
        // evidence the report exists for.
        $panel = imagecreatetruecolor($w, $panelH);
        imagefilledrectangle($panel, 0, 0, $w, $panelH, imagecolorallocate($panel, 0, 0, 0));
        imagecopymerge($image, $panel, 0, $panelY, 0, 0, $w, $panelH, 58);
        imagedestroy($panel);

        // A brand-green rule along the top edge, so the panel reads as part of
        // the app rather than as damage to the photo.
        $accent = imagecolorallocate($image, 0x34, 0xA8, 0x53);
        imagefilledrectangle($image, 0, $panelY, $w, $panelY + max(2, (int) round($size * 0.14)), $accent);

        $white = imagecolorallocate($image, 255, 255, 255);
        $muted = imagecolorallocate($image, 205, 219, 240);
        $shadow = imagecolorallocate($image, 0, 0, 0);

        $y = $panelY + $pad + $size;

        foreach ($lines as [$text, $strong]) {
            // One-pixel shadow. The panel is translucent, so a bright patch of
            // photo can show through directly behind the text.
            imagettftext($image, $size, 0, $pad + 1, $y + 1, $shadow, $font, $text);
            imagettftext($image, $size, 0, $pad, $y, $strong ? $white : $muted, $font, $text);
            $y += $lineH;
        }
    }

    /** @return array<int, array{0: string, 1: bool}> text and whether it is emphasised */
    private function lines(array $facts): array
    {
        // 6 decimal places ≈ 0.11 m. Beyond that the figure claims precision a
        // phone's GPS does not have.
        $coords = sprintf('%.6f, %.6f', $facts['latitude'], $facts['longitude']);

        return [
            [$facts['reference'].'  ·  Wasteman', true],
            [$this->truncate($facts['address'], 62), false],
            ['GPS  '.$coords, true],
            [$facts['reporter'].'  ·  '.$facts['taken_at']->format('d M Y, g:i A'), false],
        ];
    }

    /** Cuts on a word boundary so a stamped address does not end mid-word. */
    private function truncate(string $text, int $max): string
    {
        $text = trim(preg_replace('/\s+/', ' ', $text));

        if (mb_strlen($text) <= $max) {
            return $text;
        }

        $cut = mb_substr($text, 0, $max - 1);
        $space = mb_strrpos($cut, ' ');

        return ($space !== false ? mb_substr($cut, 0, $space) : $cut).'…';
    }

    private function font(): ?string
    {
        foreach (self::FONT_CANDIDATES as $path) {
            if (is_readable($path)) {
                return $path;
            }
        }

        return null;
    }

    private function load(string $path): ?\GdImage
    {
        $info = @getimagesize($path);

        if (! $info) {
            Log::warning('Photo stamp skipped: not a readable image.', ['path' => $path]);

            return null;
        }

        $image = match ($info[2]) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($path),
            IMAGETYPE_PNG => @imagecreatefrompng($path),
            IMAGETYPE_WEBP => @imagecreatefromwebp($path),
            IMAGETYPE_GIF => @imagecreatefromgif($path),
            default => null,
        };

        if (! $image) {
            Log::warning('Photo stamp skipped: unsupported image type.', [
                'path' => $path,
                'type' => $info[2],
            ]);

            return null;
        }

        return $image;
    }
}
