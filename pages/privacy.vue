<template>
  <article class="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 prose-policy">
    <p class="font-mono text-sm text-accent mb-3 tracking-wider uppercase">
      Legal
    </p>
    <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
      Privacy Policy
    </h1>
    <p class="text-sm text-[var(--text-muted)] mb-10">
      Last updated: {{ lastUpdated }}
    </p>

    <section v-for="section in sections" :key="section.title" class="mb-10">
      <h2 class="text-xl font-medium mb-3">
        {{ section.title }}
      </h2>
      <div class="space-y-3 text-[var(--text-muted)] leading-relaxed">
        <p v-for="(paragraph, i) in section.body" :key="i">
          {{ paragraph }}
        </p>
        <ul v-if="section.list?.length" class="list-disc pl-5 space-y-1">
          <li v-for="(item, i) in section.list" :key="i">
            {{ item }}
          </li>
        </ul>
      </div>
    </section>

    <p class="text-sm text-[var(--text-muted)] border-t border-[var(--border)] pt-8">
      Questions? Contact the operator at
      <a :href="`mailto:${contactEmail}`" class="text-accent hover:underline">{{ contactEmail }}</a>.
    </p>
  </article>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const siteUrl = String(config.public.siteUrl || 'https://loopgallery.a-u.us').replace(/\/$/, '')
const contactEmail = 'privacy@loopgallery.a-u.us'
const lastUpdated = 'May 19, 2026'

useSeoMeta({
  title: 'Privacy Policy — LoopGallery',
  description: 'How LoopGallery collects, uses, and protects your information.',
})

const sections = [
  {
    title: 'Overview',
    body: [
      `LoopGallery ("we", "us") operates the website and mobile app at ${siteUrl} (the "Service"). This policy explains what information we collect, how we use it, and your choices.`,
      'By using the Service, you agree to this Privacy Policy. If you do not agree, please do not use the Service.',
    ],
  },
  {
    title: 'Information we collect',
    body: ['We collect the following categories of information:'],
    list: [
      'Account information: email, display name, and profile details from Google Sign-In (via Firebase Authentication).',
      'Gallery content: usernames, bios, avatar choices, and media you upload (images and related metadata).',
      'Usage data: basic server logs (IP address, user agent, request paths) needed to operate and secure the Service.',
      'Device data (mobile app): standard WebView and app diagnostics required by Android; we do not sell this data.',
    ],
  },
  {
    title: 'How we use information',
    body: ['We use your information to:'],
    list: [
      'Provide and maintain your gallery and account.',
      'Authenticate you and enforce quotas (storage, uploads, item limits).',
      'Host and deliver your uploaded media.',
      'Improve reliability, security, and abuse prevention.',
      'Comply with legal obligations when required.',
    ],
  },
  {
    title: 'Where data is stored',
    body: [
      'Account and gallery metadata are stored in Cloudflare D1 (database). Media files are stored in Cloudflare R2 (object storage). Authentication is handled by Google Firebase.',
      'Data may be processed in regions where these providers operate. We choose infrastructure with reasonable security practices.',
    ],
  },
  {
    title: 'Sharing',
    body: [
      'We do not sell your personal information. We share data only with service providers that help run the Service (e.g. Cloudflare, Google/Firebase), when you choose to make a gallery public, or when required by law.',
      'Public galleries are visible to anyone with the link or subdomain URL you configure.',
    ],
  },
  {
    title: 'Retention and deletion',
    body: [
      'We retain your data while your account is active. You may delete individual gallery items from the dashboard. To request full account deletion, email us at the address below; we will remove your profile and associated media within a reasonable period.',
    ],
  },
  {
    title: 'Security',
    body: [
      'We use HTTPS, authenticated API routes, and access controls on storage. No method of transmission or storage is 100% secure; we cannot guarantee absolute security.',
    ],
  },
  {
    title: 'Children',
    body: [
      'The Service is not directed at children under 13. We do not knowingly collect personal information from children under 13.',
    ],
  },
  {
    title: 'Your rights',
    body: [
      'Depending on your location, you may have rights to access, correct, or delete personal data. Contact us to exercise these rights. California residents may have additional rights under the CCPA; we do not sell personal information.',
    ],
  },
  {
    title: 'Changes',
    body: [
      'We may update this policy from time to time. The "Last updated" date at the top will change when we do. Continued use after changes means you accept the updated policy.',
    ],
  },
]
</script>

<style scoped>
.prose-policy :deep(a) {
  @apply text-accent hover:underline;
}
</style>
