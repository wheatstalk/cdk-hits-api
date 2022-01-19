# Old-School Hit Tracking API

This repository contains the code for an API that counts hits grouped by a
tracking code. This API helps embed old-school hit counters on a website.

## Snippet

Copy paste (plus modify) this snippet to set up a counter on almost any website.

```html
<div class="hit-counter">Hits</div>
<script type="text/javascript">
function updateHitCounter(selector, url) {
  const xhttp = new XMLHttpRequest();
  xhttp.onload = function() {
    document.querySelector(selector).innerHTML = JSON.parse(this.responseText).count;
  };
  xhttp.open('GET', url, true);
  xhttp.send();
}

// Change codehere to another code to create a different hit counter
updateHitCounter('.hit-counter', 'https://your-api.example.com/hits/codehere');
</script>
```