<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>🎉 Thank You – Greeting Card Genius</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="/assets/favicon.png" type="image/png" />
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-orange-50 text-gray-800 font-sans">

<!-- Header -->
<header class="p-6 border-b text-center">
  <div class="flex flex-col items-center space-y-2">
    <img src="/assets/logo.png" alt="Greeting Card Genius Logo" class="h-16 w-16 rounded shadow" />
    <div>
      <a href="/" class="text-2xl font-bold hover:underline">Greeting Card Genius</a>
      <p class="text-sm text-gray-600">AI-generated cards for every occasion</p>
    </div>
    <nav class="space-x-4 text-sm pt-2">
      <a href="https://instagram.com" class="hover:underline">Instagram</a>
      <a href="https://facebook.com" class="hover:underline">Facebook</a>
      <a href="https://twitter.com" class="hover:underline">Twitter/X</a>
      <a href="/about.html" class="hover:underline">About</a>
      <a href="/contact.html" class="hover:underline">Contact</a>
      <a href="/faq.html" class="hover:underline">FAQ</a>
    </nav>
  </div>
</header>

<!-- Main -->
<main class="max-w-xl mx-auto p-8 text-center">
  <h1 class="text-3xl font-bold text-yellow-600 mb-4">🎉 Thank You for Your Order!</h1>
  <p class="text-lg mb-3">Your greeting card has been emailed to the recipient.</p>
  <p class="mb-6 text-gray-700">If you don't see it, ask them to check their spam folder or <a class="text-blue-700 font-semibold underline" href="mailto:support@greetingcardgenius.com.au">contact us</a>.</p>

  <a href="/" class="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
    ← Back to Home
  </a>

  <!-- Social CTA -->
  <div class="mt-10 p-4 border border-yellow-400 bg-yellow-100 rounded text-sm text-left max-w-md mx-auto">
    🗣️ Help us grow the chaos!<br />
    Snap your favorite card + tag us:<br />
    <strong>#GreetingCardGenius</strong> on Instagram or X<br />
    👉 Follow us at 
    <a href="https://instagram.com" class="text-blue-700 font-semibold">Instagram</a> or 
    <a href="https://twitter.com" class="text-blue-700 font-semibold">X</a><br /><br />

    <button onclick="copyCaption()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2">
      📋 Copy Caption to Share
    </button>
    <p id="copyConfirm" class="text-green-600 text-xs mt-2 hidden">✅ Copied!</p>
  </div>
</main>

<!-- Footer -->
<footer class="mt-12 text-center text-sm text-gray-500 p-4 border-t">
  <p>&copy; 2025 Greeting Card Genius · A division of <a href="https://quantumnova.com.au" target="_blank" class="text-blue-600 font-semibold">QUANTUMNOVA</a></p>
  <p>Registered in Australia | ABN 43686016526</p>
  <p class="mt-2">
    <a href="/privacy.html" class="hover:underline">Privacy Policy</a> |
    <a href="/refund.html" class="hover:underline">Refund Policy</a> |
    <a href="/terms.html" class="hover:underline">Terms & Conditions</a>
  </p>
</footer>

<!-- Copy Script -->
<script>
  function copyCaption() {
    const caption = "Just sent a hilarious AI-generated greeting card from @GreetingCardGenius 🎉 Check them out! #GreetingCardGenius";
    navigator.clipboard.writeText(caption).then(() => {
      document.getElementById("copyConfirm").classList.remove("hidden");
      setTimeout(() => {
        document.getElementById("copyConfirm").classList.add("hidden");
      }, 3000);
    });
  }
</script>

</body>
</html>
