// A small component to navigate users to documentation pages based on clojars ID and version inputs

import { h } from "preact";
import { useRef } from "preact/compat";

const navigateTo = (clojarsId: string, version: string) => {
  if (clojarsId.includes("/")) {
    window.location.href = "/d/" + clojarsId + "/" + version;
  } else {
    window.location.href = "/d/" + clojarsId + "/" + clojarsId + "/" + version;
  }
};

export const Navigator = () => {
  const clojarsIdInput = useRef<HTMLInputElement>(null);
  const versionInput = useRef<HTMLInputElement>(null);

  const navigate = () => {
    const clojarsId = clojarsIdInput.current!.value;
    const version = versionInput.current!.value;

    if (clojarsId === "") {
      return;
    }

    navigateTo(clojarsId, version);
  };

  const maybeNavigate = (event: KeyboardEvent) =>
    event.key === "Enter" && navigate();

  return (
    <div>
      <div class="cf nl2 nr2">
        <fieldset class="fl w-50-ns pa2 bn mh0">
          <label class="b db mb3">
            Group ID / Artifact ID
            <span class="normal ml2 gray f6">may be identical</span>
          </label>
          <input
            class="w-90 pa2 b--blue br2 ba no-outline"
            autocorrect="off"
            autocapitalize="none"
            onKeyUp={maybeNavigate}
            ref={clojarsIdInput}
            placeholder="e.g. 're-frame' or 'ring/ring-core'"
          />
        </fieldset>
        <fieldset class="fl w-50-ns pa2 bn mh0">
          <label class="b db mb3">
            Version
            <span class="normal ml2 gray f6">optional</span>
          </label>
          <input
            class="w-90 pa2 b--blue br2 ba no-outline"
            onKeyUp={maybeNavigate}
            ref={versionInput}
            placeholder="e.g. '1.0.2'"
          />
        </fieldset>
      </div>
      <input
        class="bg-blue white bn pv2 ph3 br2"
        type="button"
        onClick={navigate}
        value="Go to Documentation"
      />
    </div>
  );
};
