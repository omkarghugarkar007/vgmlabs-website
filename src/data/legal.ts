import type { LegalDocument } from '@/types/content';
import { company, locationLine } from './company';

/**
 * Legal page templates.
 *
 * These are drafted to describe what this specific website actually does — a
 * static, export-only marketing site with no server, no accounts, no analytics
 * and no cookies beyond what the host sets. They are accurate for the site as
 * built.
 *
 * They are NOT legal advice, and they do not cover the products or services VGM
 * Labs delivers to clients. Have both documents reviewed by a qualified adviser
 * before relying on them, and update `effectiveDate` whenever the text changes.
 *
 * If you later add analytics, embedded media, a form service or any third-party
 * script, the Privacy Policy must be updated to disclose it.
 */

export const privacyPolicy: LegalDocument = {
  title: 'Privacy Policy',
  summary: `How ${company.legalName} handles personal information in connection with this website.`,
  effectiveDate: '2026-07-25',
  sections: [
    {
      id: 'scope',
      heading: 'Scope',
      paragraphs: [
        `This policy applies to this website and to enquiries sent to ${company.email}. It does not cover systems that ${company.brand} designs, builds or operates for clients — those are governed by the agreement covering that engagement.`,
        'References to “we”, “us” and “our” mean ' + company.legalName + '.',
      ],
    },
    {
      id: 'what-we-collect',
      heading: 'Information we collect',
      paragraphs: [
        'This website is published as static files. It has no user accounts, no login, no server-side application and no database. We do not run analytics, advertising, tracking pixels or session recording on it.',
        'The only personal information we receive through this site is information you choose to send us:',
      ],
      bullets: [
        'Contact form: the fields you complete are assembled in your browser and placed into a prefilled email in your own mail application. Nothing is transmitted to us until you send that email yourself. The form does not post your details to a server.',
        'Email: if you write to us, we receive the content of your message and the details your mail provider includes, such as your email address and name.',
        'Hosting logs: our hosting provider may record technical request data such as IP address, user agent, requested path and timestamp, for the purpose of serving the site and protecting it from abuse. We do not use these logs to build profiles.',
      ],
    },
    {
      id: 'purpose',
      heading: 'Why we use it',
      bullets: [
        'To respond to your enquiry and correspond with you about it.',
        'To assess whether we are a suitable fit for the work described.',
        'To keep records of business communications where we have a legitimate interest or legal obligation to do so.',
        'To maintain the security and availability of the website.',
      ],
      paragraphs: [
        'We do not sell personal information, and we do not use enquiry content to train models.',
      ],
    },
    {
      id: 'legal-basis',
      heading: 'Legal basis',
      paragraphs: [
        'Where data protection law requires a basis for processing, we rely on your consent when you choose to contact us, and on our legitimate interest in responding to enquiries, maintaining business records and securing our systems.',
      ],
    },
    {
      id: 'retention',
      heading: 'Retention',
      paragraphs: [
        'Enquiry correspondence is retained only as long as needed to deal with the enquiry and to keep a reasonable record of business communications, after which it is deleted. Hosting logs are retained according to our hosting provider’s standard retention period.',
      ],
    },
    {
      id: 'sharing',
      heading: 'Sharing and processors',
      paragraphs: [
        'We keep third parties to a minimum. The processors involved in running this site and receiving enquiries are:',
      ],
      bullets: [
        'Our website hosting provider, which serves the static files and may keep technical request logs.',
        'Our email provider, which receives and stores enquiry correspondence.',
        'No font, analytics or tag-management provider is involved: web fonts are compiled into the site and served from our own origin.',
      ],
    },
    {
      id: 'transfers',
      heading: 'International transfers',
      paragraphs: [
        `We operate from ${locationLine}. Our hosting and email providers may process data on infrastructure located outside India. Where that occurs, we rely on the safeguards those providers make available under their own terms.`,
      ],
    },
    {
      id: 'cookies',
      heading: 'Cookies',
      paragraphs: [
        'This site sets no cookies of its own and includes no third-party tracking scripts. It stores nothing in your browser other than the ordinary HTTP cache. Because there is no tracking, there is no consent banner.',
        'A preference for reduced motion is read from your operating system or browser settings. It is only read, never stored or transmitted.',
      ],
    },
    {
      id: 'your-rights',
      heading: 'Your rights',
      paragraphs: [
        'Subject to applicable law, you may ask us to confirm what personal information we hold about you, to provide a copy, to correct inaccuracies, to delete it, or to restrict or object to how we use it. You may also withdraw consent to future correspondence at any time.',
        `To make a request, email ${company.email}. We may need to verify your identity before acting. If you are not satisfied with our response, you may complain to the relevant data protection authority.`,
      ],
    },
    {
      id: 'security',
      heading: 'Security',
      paragraphs: [
        'The site is served over HTTPS as static files, which removes most classes of server-side risk. Enquiry correspondence is held in access-controlled email accounts. No transmission over the internet can be guaranteed completely secure; please do not send credentials, or confidential or special-category information, in an initial enquiry.',
      ],
    },
    {
      id: 'children',
      heading: 'Children',
      paragraphs: [
        'This site is intended for business audiences and is not directed at children. We do not knowingly collect personal information from children.',
      ],
    },
    {
      id: 'changes',
      heading: 'Changes to this policy',
      paragraphs: [
        'If this policy changes, the revised version will be published on this page with a new effective date. Material changes to how we handle enquiry information will be described in the updated text.',
      ],
    },
    {
      id: 'contact',
      heading: 'Contact',
      paragraphs: [
        `Questions about this policy, or about how we handle personal information, can be sent to ${company.email}.`,
        `${company.legalName}, ${locationLine}. CIN: ${company.cin}.`,
      ],
    },
  ],
};

export const termsOfUse: LegalDocument = {
  title: 'Terms of Use',
  summary: `The terms on which ${company.legalName} makes this website available.`,
  effectiveDate: '2026-07-25',
  sections: [
    {
      id: 'acceptance',
      heading: 'Acceptance',
      paragraphs: [
        `This website is operated by ${company.legalName} (“${company.brand}”). By accessing it you agree to these terms. If you do not agree, please stop using the site.`,
      ],
    },
    {
      id: 'purpose',
      heading: 'Purpose of this site',
      paragraphs: [
        'This site is informational. It describes the kind of engineering and research work we do, the system layers we design, and the deployment environments we build for.',
        'Nothing on this site is an offer, a quotation, a warranty, or a commitment to deliver any particular capability, timeline or result. Any engagement is governed solely by a separate written agreement.',
      ],
    },
    {
      id: 'no-advice',
      heading: 'No professional advice',
      paragraphs: [
        'Technical descriptions, architectural guidance and failure-mode discussion on this site are general in nature. They are not advice for your specific system, data, jurisdiction or risk posture, and should not be relied on as such without an assessment of your circumstances.',
      ],
    },
    {
      id: 'forward-looking',
      heading: 'Capabilities and research statements',
      paragraphs: [
        'Descriptions of capabilities indicate the areas in which we design and build systems. Research themes describe questions we are investigating; they are not published results, and they are not claims of a completed outcome.',
        'Where this site presents work, it is labelled either as an internal capability demonstration or as a client case study. Demonstrations are our own builds. Case studies appear only with the client’s approval.',
      ],
    },
    {
      id: 'intellectual-property',
      heading: 'Intellectual property',
      paragraphs: [
        `The content, design, wordmark, copy, source code and generated visual system of this site are owned by ${company.legalName} or used with permission, and are protected by applicable intellectual property law.`,
        'You may view the site and print or download extracts for your own internal, non-commercial evaluation. You may not republish, redistribute, sell, systematically copy, frame, or use the site’s content to train a machine learning model, without our prior written consent.',
      ],
    },
    {
      id: 'acceptable-use',
      heading: 'Acceptable use',
      bullets: [
        'Do not attempt to gain unauthorised access to the site, its hosting environment or any connected system.',
        'Do not interfere with the availability of the site, or place unreasonable load on it.',
        'Do not scrape or harvest the site or its addresses for bulk or automated messaging.',
        'Do not submit unlawful, misleading, infringing or malicious content through any contact channel.',
        'Do not misrepresent your identity or your authority to act for an organisation.',
      ],
    },
    {
      id: 'submissions',
      heading: 'Enquiries and submissions',
      paragraphs: [
        'Please do not send confidential information in an initial enquiry. Until a confidentiality agreement is in place, we cannot treat unsolicited material as confidential, and we may not be able to act on it.',
        'Unsolicited ideas, proposals or specifications are received on a non-confidential basis. We may already be working on similar problems independently, and nothing in an unsolicited submission restricts our ability to continue doing so.',
      ],
    },
    {
      id: 'third-party',
      heading: 'Third-party names and links',
      paragraphs: [
        'Technology names referenced on this site belong to their respective owners and are used descriptively. Their appearance does not imply endorsement, affiliation or partnership in either direction.',
        'Any external link is provided for convenience. We do not control linked sites and are not responsible for their content or practices.',
      ],
    },
    {
      id: 'availability',
      heading: 'Availability',
      paragraphs: [
        'The site is provided on an “as available” basis. We may change, suspend or withdraw any part of it at any time without notice. Interactive visual elements require a browser with WebGL support; where it is unavailable, the site presents the same information without it.',
      ],
    },
    {
      id: 'liability',
      heading: 'Limitation of liability',
      paragraphs: [
        'To the fullest extent permitted by law, we exclude liability for any indirect, incidental, special or consequential loss, and for any loss of profit, revenue, data, goodwill or anticipated savings, arising from use of this website or reliance on its content.',
        'Nothing in these terms excludes or limits liability that cannot lawfully be excluded or limited, including liability for fraud or fraudulent misrepresentation.',
      ],
    },
    {
      id: 'governing-law',
      heading: 'Governing law',
      paragraphs: [
        `These terms are governed by the laws of India. The courts at ${company.city}, ${company.region} have exclusive jurisdiction over any dispute arising from them, subject to any mandatory rights you have under the law of your own country of residence.`,
      ],
    },
    {
      id: 'changes',
      heading: 'Changes to these terms',
      paragraphs: [
        'We may update these terms from time to time. The current version is always the one published on this page, with the effective date shown above.',
      ],
    },
    {
      id: 'contact',
      heading: 'Contact',
      paragraphs: [
        `Questions about these terms can be sent to ${company.email}.`,
        `${company.legalName}, ${locationLine}. CIN: ${company.cin}.`,
      ],
    },
  ],
};
