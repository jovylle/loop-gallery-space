<template>
  <article class="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
    <p class="font-mono text-sm text-accent mb-3 tracking-wider uppercase">
      Account
    </p>
    <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
      Delete your LoopGallery account
    </h1>
    <p class="text-sm text-[var(--text-muted)] mb-10">
      Last updated: {{ lastUpdated }}
    </p>

    <section class="mb-10 space-y-3 text-[var(--text-muted)] leading-relaxed">
      <p>
        You can request deletion of your LoopGallery account and associated data at any time.
        After we process your request, you will not be able to sign in or recover your gallery.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-medium mb-3">
        How to request deletion
      </h2>
      <ol class="list-decimal pl-5 space-y-2 text-[var(--text-muted)] leading-relaxed">
        <li>Sign in to LoopGallery with the Google account you want removed.</li>
        <li>
          Email
          <a :href="`mailto:${contactEmail}?subject=Account%20deletion%20request`" class="text-accent hover:underline">{{ contactEmail }}</a>
          from the same email address on your Google account (or state which account to delete).
        </li>
        <li>Use the subject line: <strong class="text-[var(--text-primary)]">Account deletion request</strong>.</li>
        <li>We will confirm by email and delete your account within <strong class="text-[var(--text-primary)]">30 days</strong> (usually sooner).</li>
      </ol>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-medium mb-3">
        What we delete
      </h2>
      <ul class="list-disc pl-5 space-y-1 text-[var(--text-muted)]">
        <li>Profile (username, display name, bio, avatar)</li>
        <li>All gallery items and uploaded photos/videos (R2 storage)</li>
        <li>Account metadata in our database (D1)</li>
        <li>Usage/quota records tied to your user ID</li>
      </ul>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-medium mb-3">
        What we may keep
      </h2>
      <ul class="list-disc pl-5 space-y-1 text-[var(--text-muted)]">
        <li>Server logs (IP, user agent) for up to <strong class="text-[var(--text-primary)]">90 days</strong> for security and abuse prevention, then deleted or anonymized</li>
        <li>Information we must retain if required by law</li>
      </ul>
    </section>

    <section class="mb-10 space-y-3 text-[var(--text-muted)] leading-relaxed">
      <p>
        You can delete individual photos from your gallery in the dashboard without deleting your whole account.
      </p>
      <p>
        See our
        <NuxtLink to="/privacy" class="text-accent hover:underline">Privacy Policy</NuxtLink>
        for more detail.
      </p>
    </section>
  </article>
</template>

<script setup lang="ts">
const contactEmail = 'privacy@loopgallery.a-u.us'
const lastUpdated = 'May 19, 2026'

useSeoMeta({
  title: 'Delete account — LoopGallery',
  description: 'Request deletion of your LoopGallery account and associated data.',
})
</script>
