/**
 * Auto-refresh helper for flight detail pages.
 *
 * The original implementation just did `setTimeout(() => location.reload(),
 * 5000)`. That works for read-only views but **wipes anything a user is
 * typing into an uncontrolled <input>** when the timer fires — which is
 * exactly what happened on the new-handler form: type "Execujet", move
 * focus, ~5s later the page reloads and the value is gone.
 *
 * This version skips the reload whenever any form on the page has a dirty
 * input (current value differs from default). Robust against focus
 * changes — the user can blur out of the field and we still won't blow
 * away their unsaved edits.
 */
export function AutoRefresh() {
  const script = `
setTimeout(function () {
  if (document.visibilityState !== 'visible') return;
  for (var i = 0; i < document.forms.length; i++) {
    var f = document.forms[i];
    for (var j = 0; j < f.elements.length; j++) {
      var e = f.elements[j];
      var ty = e.type;
      if (ty === 'submit' || ty === 'button' || ty === 'reset' || ty === 'hidden') continue;
      if (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA') {
        if (ty === 'checkbox' || ty === 'radio') {
          if (e.checked !== e.defaultChecked) return;
        } else if (e.value !== e.defaultValue) {
          return;
        }
      } else if (e.tagName === 'SELECT') {
        for (var k = 0; k < e.options.length; k++) {
          if (e.options[k].selected !== e.options[k].defaultSelected) return;
        }
      }
    }
  }
  location.reload();
}, 5000);
`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
