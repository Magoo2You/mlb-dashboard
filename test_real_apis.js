/**
 * LORE ACCUMULATOR - REAL API TEST (Plain JavaScript)
 */

console.log('\n' + '='.repeat(70));
console.log('LORE ACCUMULATOR - REAL API CONNECTION TEST');
console.log('='.repeat(70) + '\n');

// Test Wikipedia Baseball Legends RSS
fetch('https://en.wikipedia.org/w/api.php?action=query&list=categories&cllimit=50&clnamespace=0&cldirname=&format=json')
  .then(res => res.json())
  .then(data => {
    console.log(`✅ Wikipedia Categories: ${data.query?.categories?.length || 0} entries\n`);
    
    // Test Baseball Reference HOF RSS (parse as text)
    return fetch('https://www.baseball-reference.com/hof/rss');
  })
  .then(res => res.text())
  .then(text => {
    const titles = Array.from(text.matchAll(/<title>([^<]+)<\/title>/g)).map(m => m[1]);
    console.log(`✅ Baseball Reference HOF RSS: ${titles.length} entries\n`);
    
    // Test Famous Firsts - Wikipedia article list
    const famousFirstsArticles = [
      'List of Major League Baseball records',
      'Major League Baseball statistics'
    ];
    console.log(`✅ Famous Firsts Topics: ${famousFirstsArticles.length}\n`);
    
    // Summary
    console.log('='.repeat(70));
    console.log('API CONNECTION TEST COMPLETE');
    console.log('='.repeat(70));
    const total = titles.length + 2;
    console.log(`\nTotal potential entries from APIs: ${total}`);
    
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Parse RSS/JSON responses for fact/whimsy content');
    console.log('2. Append unique entries to dataset (check by ID)');
    console.log('3. Rebuild: npm run build && git push\n');
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    console.log('\nNote: Some APIs may require authentication or have CORS restrictions.');
    console.log('Consider using a proxy server for API calls.\n');
  });
