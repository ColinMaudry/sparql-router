<template>
  <div class="container">
    <div class="jumbotron">
      <p><strong>queery.link</strong> is a service that enables <a href="https://en.wikipedia.org/wiki/SPARQL" target="_blank">SPARQL</a> practitioners to share SPARQL queries with both humans and machines.</p>
    </div>
    <h4>A SPARQL query...</h4>
    <pre><code>#Cats on Wikidata
    #From https://blog.wikimedia.de/2016/10/30/10-cool-queries-for-wikidata-that-will-blow-your-mind-number-7-will-shock-you/

    SELECT ?item ?itemLabel
    WHERE
    {
        ?item wdt:P31 wd:Q146 .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
    }
    </code></pre>
    <h4>...and an endpoint</h4>
    <p><code>https://query.wikidata.org./bigdata/namespace/wdq/sparql</code> (Wikidata SPARQL endpoint)</p>
    <p>You can actually see this query here: <a href="/#/view/tables/cats-on-wikidata">/#/view/tables/cats-on-wikidata</a></p>
    <h3>Web app + REST API</h3>
    <p>One strong benefit of queery.link is that all operations (creation, editing, deletion, retrieval of query results) can be performed either:</p>
      <ul>
        <li>manually in the Web app</li>
        <li>programmatically via <a href="/api">the API</a></li>
      </ul>
    <h3 id="use-cases">Use cases</h3>
    <ul>
    <li>sharing a query on a specific endpoint with other practitioners for support/debugging/showing off</li>
    <li>saving your favourite queries</li>
    <li>sharing data from an RDF triple store with someone who can consume CSV, XML or JSON... but not RDF</li>
    </ul>
    <h3 id="who-did-this-">Who did this?</h3>
    <p>I'm <a href="http://colin.maudry.com">Colin Maudry</a>, a technical consultant in Open Data, who specializes in Open Government and Semantic Web technologies.</p>
    <p><a href="/#/feedback">Feedback</a> is very much welcome!</p>

  </div>
</template>
<script>
</script>
<style lang="scss">
</style>
