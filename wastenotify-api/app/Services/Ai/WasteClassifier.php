<?php

namespace App\Services\Ai;

interface WasteClassifier
{
    /**
     * Classify a waste photo.
     *
     * @param  string  $absolutePath  Readable path to the image on disk.
     * @param  string  $mimeType      image/jpeg | image/png | image/gif | image/webp
     */
    public function classify(string $absolutePath, string $mimeType): Classification;
}
