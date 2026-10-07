/**
 * Privacy Policy and Terms, written against what this app actually does.
 *
 * Google Play requires a privacy policy that is accurate about the data the app
 * collects and shares, reachable both inside the app and at a public URL, and —
 * for any app with account creation — a route to delete the account. The
 * disclosures below must be kept in step with the app's real behaviour and with
 * the Play Console Data Safety form; a policy that drifts from the code is worse
 * than none, because it is a false statement to users.
 *
 * These sections are the fallback shown when nothing has been published yet, or
 * when the device is offline. The live text comes from GET /api/legal/{slug}
 * and is edited under the admin console's Policies screen.
 *
 * Operator identity — the controller's name, address, privacy contact and
 * grievance officer — is NOT here. It lives in the operator's own settings and
 * is served alongside the policy, because only they can supply it truthfully and
 * a hard-coded placeholder in this file previously shipped straight onto the
 * live privacy page.
 */

export const LEGAL_UPDATED = '23 August 2026';

export interface Section {
  heading: string;
  body: string[];
  bullets?: string[];
}

export const PRIVACY: Section[] = [
  {
    heading: 'What this policy covers',
    body: [
      'Wasteman lets residents report uncollected or illegally dumped waste to their municipal corporation. This policy explains what the app collects, why, who it is shared with, and how to get it deleted.',
      'It applies to the Wasteman mobile app and its web version.',
    ],
  },
  {
    heading: 'Information you give us',
    body: ['You provide the following when you create an account and file reports:'],
    bullets: [
      'Name, email address and phone number. Email and phone are mandatory because the clean-up crew may need to reach you at the location, and resolution notices are sent to you.',
      'A password, stored only as a salted hash — never in readable form.',
      'An optional profile photo.',
      'An optional home ward.',
      'Photographs you take of waste, plus any note or landmark you add.',
    ],
  },
  {
    heading: 'Information collected automatically',
    body: ['When you file a report the app records:'],
    bullets: [
      'The precise location of the waste (GPS coordinates), and the street address derived from it. This is the location of the waste, captured when you submit a report — the app does not track you in the background and does not record your location at any other time.',
      'The date and time of the report.',
      'The ward the coordinates fall inside, determined from published municipal ward boundaries.',
    ],
  },
  {
    heading: 'Device permissions',
    body: ['The app asks for these permissions, and only uses them for the stated purpose:'],
    bullets: [
      'Camera — to photograph waste when you choose to file a report.',
      'Photos / storage — to attach an existing picture instead of taking a new one.',
      'Location — to place your report on the map and route it to the correct ward. Foreground only; you can decline and enter the address manually.',
    ],
  },
  {
    heading: 'Automated analysis of your photo',
    body: [
      'Photographs you submit are sent to Anthropic’s Claude API, a third-party AI service, which classifies the waste type, estimates severity and volume, and identifies visible items. The result routes your report to the right municipal team.',
      'Only the photograph and a fixed instruction are sent. Your name, contact details and account identifiers are not sent with it.',
      'The classification is advisory. A municipal officer reviews every report, and you can see and dispute the classification on the report screen.',
    ],
  },
  {
    heading: 'Who your information is shared with',
    body: ['Your data is not sold, rented, or used for advertising. It is shared only with:'],
    bullets: [
      'The municipal corporation and the specific ward team assigned to your report — they see the photo, location, the AI classification, and your name, email and phone so they can contact you on site.',
      'Anthropic, for the photo classification described above.',
      'Google Maps, which receives map view coordinates in order to render the map.',
      'Law enforcement or a public authority, where we are legally required to disclose it.',
    ],
  },
  {
    heading: 'What other users can see',
    body: [
      'Reports appear on a public map inside the app showing the waste photo, its location and its status. Your name, email address and phone number are never shown on the public map or to other residents — only to the assigned municipal team.',
    ],
  },
  {
    heading: 'How long we keep it',
    body: [
      'Reports and their photographs are retained as civic records of what was reported and cleared. Your account details are kept until you delete your account.',
    ],
  },
  {
    heading: 'Deleting your account',
    body: [
      'You can delete your account at any time from Profile → Delete account, inside the app. Deletion removes your name, email address, phone number, profile photo and notifications, and signs out all your devices.',
      'Reports you filed are kept but are permanently disconnected from you and anonymised. They remain because a municipal crew may have acted on them and they form part of the ward’s public record — but they can no longer be traced back to you.',
      'Account deletion is immediate and cannot be undone.',
    ],
  },
  {
    heading: 'Security',
    body: [
      'Access is protected by a token issued at sign-in. Passwords are stored as hashes. Changing your password signs out every other device.',
      'No system is perfectly secure, and we cannot guarantee absolute security of information transmitted over the internet.',
    ],
  },
  {
    heading: 'Children',
    body: [
      'Wasteman is not directed at children under 13, and we do not knowingly collect their information. If you believe a child has created an account, contact us and we will remove it.',
    ],
  },
  {
    heading: 'Your rights',
    body: [
      'You can view and correct your name, email, phone and ward from the Profile screen, download nothing further than what is shown there, and delete your account as described above. For any other request, contact the operator listed at the end of this policy.',
    ],
  },
  {
    heading: 'Changes',
    body: [
      'If this policy changes materially we will show a notice in the app. The date at the top reflects the current version.',
    ],
  },
];

export const TERMS: Section[] = [
  {
    heading: 'Agreement',
    body: [
      'By creating an account or using Wasteman, you agree to these terms. If you do not agree, do not use the app.',
    ],
  },
  {
    heading: 'What the service does',
    body: [
      'Wasteman forwards waste reports from residents to a municipal corporation. It is a reporting channel, not the waste-collection service itself.',
      'We do not control whether or when a municipal team acts on a report, and submitting a report is not a guarantee that the waste will be cleared or cleared within any particular time. Timelines shown in the app are targets, not commitments.',
    ],
  },
  {
    heading: 'Your account',
    body: [
      'You must give accurate contact details and keep your password confidential. You are responsible for activity under your account. Tell us immediately if you believe it has been used without your permission.',
      'One account per person. Accounts are not transferable.',
    ],
  },
  {
    heading: 'Using the service properly',
    body: ['You agree not to:'],
    bullets: [
      'File false, duplicate or malicious reports, or reports about something that is not waste.',
      'Photograph people in a way that identifies them, or upload images containing personal information, nudity, or anything unlawful.',
      'Trespass, or put yourself or others at risk, in order to photograph waste. Never enter private property or a hazardous area to file a report.',
      'Use the service to harass anyone, including municipal staff.',
      'Attempt to access other users’ data, or to disrupt, probe or overload the service.',
    ],
  },
  {
    heading: 'Your content',
    body: [
      'You keep ownership of the photographs you upload. By submitting one, you grant the operator and the municipal corporation a licence to store it, process it, and use it for handling and recording the report.',
      'You confirm that you took the photograph, or have the right to submit it.',
    ],
  },
  {
    heading: 'Automated classification',
    body: [
      'Reports are classified by an automated system. Automated classification can be wrong. It does not replace the judgement of a municipal officer, and no decision that affects you is made by it alone.',
    ],
  },
  {
    heading: 'Suspension',
    body: [
      'We may suspend or close an account that repeatedly files false reports, uploads prohibited content, or otherwise breaks these terms.',
    ],
  },
  {
    heading: 'Availability',
    body: [
      'The service is provided "as is". We do not promise it will be uninterrupted or error-free, and we may change or withdraw features.',
    ],
  },
  {
    heading: 'Emergencies',
    body: [
      'Wasteman is not an emergency service. For hazardous materials, medical waste, fire, blocked drains causing flooding, or any immediate danger, contact the emergency services or your municipal helpline directly. Do not rely on this app.',
    ],
  },
  {
    heading: 'Liability',
    body: [
      'To the extent permitted by law, the operator is not liable for indirect or consequential loss arising from use of the service, or from a municipal body’s action or inaction on a report. Nothing here excludes liability that cannot lawfully be excluded.',
    ],
  },
  {
    heading: 'Governing law',
    body: [
      'These terms are governed by the laws of India, and the courts of Tamil Nadu have jurisdiction over any dispute.',
    ],
  },
];
