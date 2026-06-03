(() => {
  const storageKey = "edegFloatingPrompts";
  const generalCategory = "\u901a\u7528";
  const allCategory = "__all__";
  const editableSelector = [
    "textarea",
    "input[type='text']",
    "input[type='search']",
    "input[type='url']",
    "input[type='email']",
    "input[type='password']",
    "input:not([type])",
    "[contenteditable='true']",
    "[contenteditable='plaintext-only']",
    "[role='textbox']",
    "#prompt-textarea",
  ].join(",");

  const defaultCategories = [generalCategory, "\u5199\u4f5c", "\u4ee3\u7801", "\u4efb\u52a1"];
  const defaultPrompts = [
    {
      title: "\u6539\u5199\u6da6\u8272",
      body: "\u8bf7\u5e2e\u6211\u628a\u4e0b\u9762\u8fd9\u6bb5\u5185\u5bb9\u6539\u5199\u5f97\u66f4\u6e05\u6670\u3001\u81ea\u7136\u3001\u4e13\u4e1a\uff0c\u4fdd\u7559\u539f\u610f\uff1a",
      category: "\u5199\u4f5c",
    },
    {
      title: "\u4ee3\u7801\u5ba1\u67e5",
      body: "\u8bf7\u4ece\u53ef\u8bfb\u6027\u3001\u8fb9\u754c\u60c5\u51b5\u3001\u6027\u80fd\u548c\u6f5c\u5728 bug \u7684\u89d2\u5ea6\u5ba1\u67e5\u4e0b\u9762\u7684\u4ee3\u7801\uff0c\u5e76\u7ed9\u51fa\u4fee\u6539\u5efa\u8bae\uff1a",
      category: "\u4ee3\u7801",
    },
    {
      title: "\u62c6\u89e3\u4efb\u52a1",
      body: "\u8bf7\u628a\u4e0b\u9762\u76ee\u6807\u62c6\u89e3\u6210\u53ef\u6267\u884c\u6b65\u9aa4\uff0c\u5e76\u6309\u4f18\u5148\u7ea7\u7ed9\u51fa\u4e00\u4e2a\u7b80\u6d01\u8ba1\u5212\uff1a",
      category: "\u4efb\u52a1",
    },
  ];

  let prompts = defaultPrompts;
  let categories = defaultCategories;
  let selectedCategory = allCategory;
  let searchText = "";
  let activeField = null;
  let editingIndex = null;
  let hideTimer = 0;
  let repositionTimer = 0;
  let followTimer = 0;
  let observedField = null;
  let lastAnchorRect = null;
  let fieldResizeObserver = null;
  let pageMutationObserver = null;

  const dock = document.createElement("section");
  dock.className = "edeg-prompt-dock";
  dock.dataset.state = "collapsed";
  dock.dataset.visible = "false";
  dock.dataset.placement = "above";
  dock.setAttribute("aria-label", "edeg prompt helper");

  dock.innerHTML = `
    <button class="edeg-prompt-toggle" type="button" aria-expanded="false">
      <span class="edeg-prompt-mark" aria-hidden="true">T</span>
      <span class="edeg-prompt-toggle-label">\u63d0\u793a\u8bcd</span>
      <span class="edeg-prompt-count">0</span>
    </button>
    <div class="edeg-prompt-panel">
      <div class="edeg-prompt-head">
        <div>
          <h2>\u63d0\u793a\u8bcd\u5e93</h2>
          <p>\u641c\u7d22\u6216\u5207\u6362\u5206\u7c7b\uff0c\u70b9\u51fb\u5361\u7247\u5373\u53ef\u586b\u5165\u3002</p>
        </div>
        <label class="edeg-prompt-search-wrap">
          <span aria-hidden="true">${iconSearch()}</span>
          <input class="edeg-prompt-search" type="search" placeholder="\u641c\u7d22\u6807\u9898\u3001\u5185\u5bb9\u6216\u5206\u7c7b" aria-label="\u641c\u7d22\u63d0\u793a\u8bcd" />
        </label>
        <button class="edeg-prompt-close" type="button" aria-label="\u6536\u8d77\u63d0\u793a\u8bcd\u9762\u677f">x</button>
      </div>

      <div class="edeg-prompt-toolbar">
        <div class="edeg-prompt-category-tabs" aria-label="\u5206\u7c7b\u7b5b\u9009"></div>
        <div class="edeg-prompt-compact-actions">
          <button class="edeg-prompt-open-add" type="button">\u65b0\u589e\u63d0\u793a\u8bcd</button>
          <button class="edeg-prompt-open-category" type="button">\u5206\u7c7b\u7ba1\u7406</button>
        </div>
      </div>

      <div class="edeg-prompt-popover" hidden>
        <div class="edeg-prompt-popover-head">
          <strong class="edeg-prompt-popover-title">\u65b0\u589e\u63d0\u793a\u8bcd</strong>
          <button class="edeg-prompt-popover-close" type="button" aria-label="\u5173\u95ed">x</button>
        </div>
        <div class="edeg-prompt-popover-body">
          <form class="edeg-prompt-form">
            <input class="edeg-prompt-title-input" type="text" maxlength="18" placeholder="\u6807\u9898" aria-label="\u63d0\u793a\u8bcd\u6807\u9898" />
            <select class="edeg-prompt-new-category" aria-label="\u63d0\u793a\u8bcd\u5206\u7c7b"></select>
            <textarea class="edeg-prompt-body-input" rows="2" placeholder="\u8f93\u5165\u8981\u4fdd\u5b58\u7684\u63d0\u793a\u8bcd" aria-label="\u63d0\u793a\u8bcd\u5185\u5bb9"></textarea>
            <button class="edeg-prompt-save" type="submit">\u4fdd\u5b58</button>
          </form>

          <form class="edeg-prompt-category-form">
            <select class="edeg-prompt-category-select" aria-label="\u9009\u62e9\u8981\u7f16\u8f91\u7684\u5206\u7c7b"></select>
            <input class="edeg-prompt-category-name" type="text" maxlength="18" placeholder="\u5206\u7c7b\u540d\u79f0" aria-label="\u5206\u7c7b\u540d\u79f0" />
            <button class="edeg-prompt-category-add" type="button">\u65b0\u589e</button>
            <button class="edeg-prompt-category-rename" type="submit">\u6539\u540d</button>
            <button class="edeg-prompt-category-delete" type="button">\u5220\u9664</button>
          </form>
        </div>
      </div>

      <div class="edeg-prompt-list" aria-live="polite"></div>
    </div>
  `;

  const toggle = dock.querySelector(".edeg-prompt-toggle");
  const closeButton = dock.querySelector(".edeg-prompt-close");
  const count = dock.querySelector(".edeg-prompt-count");
  const searchInput = dock.querySelector(".edeg-prompt-search");
  const categoryTabs = dock.querySelector(".edeg-prompt-category-tabs");
  const popover = dock.querySelector(".edeg-prompt-popover");
  const popoverTitle = dock.querySelector(".edeg-prompt-popover-title");
  const categoryForm = dock.querySelector(".edeg-prompt-category-form");
  const categorySelect = dock.querySelector(".edeg-prompt-category-select");
  const categoryName = dock.querySelector(".edeg-prompt-category-name");
  const newCategory = dock.querySelector(".edeg-prompt-new-category");
  const list = dock.querySelector(".edeg-prompt-list");
  const form = dock.querySelector(".edeg-prompt-form");
  const titleInput = dock.querySelector(".edeg-prompt-title-input");
  const bodyInput = dock.querySelector(".edeg-prompt-body-input");

  document.documentElement.append(dock);

  chrome.storage.local.get([storageKey], (result) => {
    normalizeStoredData(result[storageKey]);
    renderAll();
    savePrompts();
  });

  function normalizeStoredData(stored) {
    const rawPrompts = Array.isArray(stored) ? stored : Array.isArray(stored?.prompts) ? stored.prompts : defaultPrompts;
    const rawCategories = Array.isArray(stored?.categories) ? stored.categories : defaultCategories;

    categories = uniqueNames([generalCategory, ...rawCategories]).filter(Boolean);
    prompts = rawPrompts.map((prompt) => ({
      title: String(prompt.title || "\u672a\u547d\u540d\u63d0\u793a\u8bcd"),
      body: String(prompt.body || ""),
      category: categories.includes(prompt.category) ? prompt.category : generalCategory,
    })).filter((prompt) => prompt.body.trim());

    categories = uniqueNames([generalCategory, ...categories, ...prompts.map((prompt) => prompt.category)]);
  }

  function uniqueNames(names) {
    return [...new Set(names.map((name) => String(name || "").trim()).filter(Boolean))];
  }

  function savePrompts() {
    chrome.storage.local.set({ [storageKey]: { prompts, categories } });
  }

  function setState(state) {
    schedulePosition();
    dock.dataset.state = state;
    toggle.setAttribute("aria-expanded", String(state === "expanded"));
    requestAnimationFrame(schedulePosition);
  }

  function getEditableRoot(element) {
    if (!(element instanceof HTMLElement)) return null;
    const root = element.closest(editableSelector);
    if (!root || root.closest(".edeg-prompt-dock")) return null;
    if ("disabled" in root && root.disabled) return null;
    if ("readOnly" in root && root.readOnly) return null;
    return root;
  }

  function showForField(field) {
    clearTimeout(hideTimer);
    activeField = field;
    dock.dataset.visible = "true";
    observeActiveField(field);
    schedulePosition();
    trackPositionForAWhile();
  }

  function maybeHideDock() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (dock.dataset.state === "expanded" || !popover.hidden) return;

      const focusedEditable = getEditableRoot(document.activeElement);
      if (focusedEditable) {
        showForField(focusedEditable);
        return;
      }

      if (dock.matches(":hover") || dock.contains(document.activeElement)) return;

      dock.dataset.visible = "false";
      setState("collapsed");
      activeField = null;
      lastAnchorRect = null;
      stopTrackingField();
    }, 1200);
  }

  function schedulePosition() {
    cancelAnimationFrame(repositionTimer);
    repositionTimer = requestAnimationFrame(positionDock);
  }

  function trackPositionForAWhile() {
    clearInterval(followTimer);
    followTimer = setInterval(() => {
      schedulePosition();
      if (!activeField || dock.dataset.visible === "false") {
        clearInterval(followTimer);
        followTimer = 0;
      }
    }, 180);
  }

  function observeActiveField(field) {
    if (observedField === field) return;
    stopTrackingField();
    observedField = field;

    if ("ResizeObserver" in window) {
      fieldResizeObserver = new ResizeObserver(() => {
        schedulePosition();
        trackPositionForAWhile();
      });

      getPositionWatchTargets(field).forEach((target) => {
        try {
          fieldResizeObserver.observe(target);
        } catch {
          // Some page-owned nodes can become unavailable while ChatGPT re-renders.
        }
      });
    }

    if ("MutationObserver" in window) {
      pageMutationObserver = new MutationObserver(() => {
        schedulePosition();
        trackPositionForAWhile();
      });

      const mutationTarget = getComposerContainer(field) || field;
      pageMutationObserver.observe(mutationTarget, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }
  }

  function stopTrackingField() {
    clearInterval(followTimer);
    followTimer = 0;
    observedField = null;
    if (fieldResizeObserver) fieldResizeObserver.disconnect();
    if (pageMutationObserver) pageMutationObserver.disconnect();
    fieldResizeObserver = null;
    pageMutationObserver = null;
  }

  function getPositionWatchTargets(field) {
    const targets = [field, field.parentElement, getComposerContainer(field)];
    let node = field;
    for (let i = 0; i < 12 && node?.parentElement; i += 1) {
      node = node.parentElement;
      targets.push(node);
    }
    return [...new Set(targets.filter(Boolean))];
  }

  function getComposerContainer(field) {
    return field.closest([
      "form",
      "[data-testid*='composer']",
      "[data-testid*='prompt']",
      "[aria-label*='Message']",
      "[aria-label*='message']",
      "[class*='composer']",
      "[class*='prompt']",
      "[class*='input']",
      "[class*='textarea']",
    ].join(",")) || field.parentElement;
  }

  function getAnchorRect(field) {
    const fieldRect = field.getBoundingClientRect();
    const fieldCenterX = fieldRect.left + fieldRect.width / 2;
    const fieldCenterY = fieldRect.top + fieldRect.height / 2;
    const maxReasonableWidth = Math.min(window.innerWidth - 8, Math.max(fieldRect.width * 2.4, fieldRect.width + 180, 360));
    const maxReasonableHeight = Math.min(520, window.innerHeight * 0.7);

    const candidates = getPositionWatchTargets(field)
      .map((element) => ({
        element,
        rect: element.getBoundingClientRect(),
        style: window.getComputedStyle(element),
      }))
      .filter(({ element, rect }) => {
        if (element === document.body || element === document.documentElement) return false;
        if (rect.width <= 0 || rect.height <= 0) return false;
        if (rect.width < Math.max(180, fieldRect.width * 0.82)) return false;
        if (rect.height < fieldRect.height) return false;
        if (rect.width > maxReasonableWidth) return false;
        if (rect.height > maxReasonableHeight) return false;
        if (fieldCenterX < rect.left - 2 || fieldCenterX > rect.right + 2) return false;
        if (fieldCenterY < rect.top - 2 || fieldCenterY > rect.bottom + 2) return false;
        return true;
      });

    if (!candidates.length) return fieldRect;

    const scored = candidates.map(({ element, rect, style }) => {
      const containsField =
        rect.left <= fieldRect.left + 2 &&
        rect.right >= fieldRect.right - 2 &&
        rect.top <= fieldRect.top + 2 &&
        rect.bottom >= fieldRect.bottom - 2;
      const classSignal = /composer|prompt|input|textarea|editor|message/i.test(`${element.className || ""} ${element.id || ""}`);
      const borderWidth = parseFloat(style.borderTopWidth) + parseFloat(style.borderRightWidth) + parseFloat(style.borderBottomWidth) + parseFloat(style.borderLeftWidth);
      const hasChrome = borderWidth > 0 || parseFloat(style.borderRadius) > 10 || style.boxShadow !== "none" || style.backgroundColor !== "rgba(0, 0, 0, 0)";
      const heightGrowth = Math.max(0, rect.height - fieldRect.height);
      const widthFit = 1 - Math.min(Math.abs(rect.width - fieldRect.width) / Math.max(rect.width, fieldRect.width, 1), 1);
      const score =
        (containsField ? 900 : 0) +
        (classSignal ? 260 : 0) +
        (hasChrome ? 180 : 0) +
        heightGrowth * 3 +
        rect.height * 1.8 +
        widthFit * 120;
      return { rect, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].rect;
  }

  function positionDock() {
    const liveField = getEditableRoot(document.activeElement);
    if (liveField) activeField = liveField;

    if (!activeField || !document.documentElement.contains(activeField)) {
      if (!lastAnchorRect || dock.dataset.visible === "false") {
        dock.dataset.visible = "false";
        return;
      }
    }

    let rect = activeField && document.documentElement.contains(activeField) ? getAnchorRect(activeField) : lastAnchorRect;
    if (rect.width <= 0 || rect.height <= 0) {
      if (lastAnchorRect && lastAnchorRect.width > 0 && lastAnchorRect.height > 0) {
        rect = lastAnchorRect;
      } else {
        dock.dataset.visible = "false";
        return;
      }
    }
    lastAnchorRect = rect;

    const isExpanded = dock.dataset.state === "expanded";
    const panelWidth = isExpanded ? Math.min(760, Math.max(320, rect.width)) : 50;
    const center = rect.left + rect.width / 2;
    const clampedCenter = Math.max(panelWidth / 2 + 12, Math.min(window.innerWidth - panelWidth / 2 - 12, center));
    const gap = 12;
    const edgePadding = 12;
    const bottomSafePadding = Math.round(Math.min(72, Math.max(36, window.innerHeight * 0.07)));
    const toggleHeight = 48;
    const collapsedToggleSize = 50;
    const availableAbove = Math.max(0, rect.top - gap - edgePadding);
    const availableBelow = Math.max(0, window.innerHeight - rect.bottom - gap - bottomSafePadding);
    const preferredPanelHeight = Math.round(Math.min(
      Math.max(window.innerHeight * 0.72, rect.height * 2.2, 720),
      window.innerHeight * 0.82,
      840,
    ));
    const neededHeight = toggleHeight + preferredPanelHeight + 10;
    const placeBelow = availableAbove < neededHeight && availableBelow > availableAbove;
    const availableSpace = placeBelow ? availableBelow : availableAbove;
    const maxPanelHeight = Math.max(240, availableSpace - toggleHeight - 10);
    const panelHeight = Math.round(Math.max(260, Math.min(preferredPanelHeight, maxPanelHeight)));
    const listMinHeight = Math.round(Math.max(160, Math.min(650, panelHeight - 190)));
    const collapsedHasSpaceAbove = availableAbove >= collapsedToggleSize + gap;
    const collapsedTop = collapsedHasSpaceAbove
      ? Math.max(edgePadding + collapsedToggleSize / 2, rect.top - gap - collapsedToggleSize / 2)
      : Math.min(window.innerHeight - bottomSafePadding - collapsedToggleSize / 2, rect.bottom + gap + collapsedToggleSize / 2);
    const top = isExpanded
      ? (placeBelow ? Math.min(window.innerHeight - bottomSafePadding, rect.bottom + gap) : Math.max(edgePadding, rect.top - gap))
      : collapsedTop;

    dock.style.width = `${panelWidth}px`;
    dock.style.left = `${clampedCenter}px`;
    dock.style.top = `${top}px`;
    dock.style.setProperty("--edeg-panel-height", `${panelHeight}px`);
    dock.style.setProperty("--edeg-list-min-height", `${listMinHeight}px`);
    dock.dataset.placement = isExpanded
      ? (placeBelow ? "below" : "above")
      : (collapsedHasSpaceAbove ? "above" : "below");
    dock.dataset.visible = "true";
  }

  function insertPrompt(text) {
    if (!activeField) return;

    activeField.focus();
    if (activeField.isContentEditable || activeField.getAttribute("role") === "textbox") {
      document.execCommand("insertText", false, text);
      activeField.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
      schedulePosition();
      return;
    }

    const field = activeField;
    const current = field.value || "";
    const start = Number.isInteger(field.selectionStart) ? field.selectionStart : current.length;
    const end = Number.isInteger(field.selectionEnd) ? field.selectionEnd : current.length;
    const needsSpacer = current && start === current.length && !current.endsWith("\n") ? "\n\n" : "";
    const nextValue = `${current.slice(0, start)}${needsSpacer}${text}${current.slice(end)}`;
    const caret = start + needsSpacer.length + text.length;

    field.value = nextValue;
    field.setSelectionRange(caret, caret);
    field.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
    schedulePosition();
  }

  function renderAll() {
    renderCategoryControls();
    renderPrompts();
    schedulePosition();
  }

  function openPopover(mode) {
    popover.hidden = false;
    popover.dataset.mode = mode;
    popoverTitle.textContent = mode === "add" ? "\u65b0\u589e\u63d0\u793a\u8bcd" : "\u5206\u7c7b\u7ba1\u7406";
    if (mode === "add") {
      titleInput.focus();
    } else {
      categorySelect.focus();
    }
    schedulePosition();
  }

  function closePopover() {
    popover.hidden = true;
    popover.dataset.mode = "";
    schedulePosition();
  }

  function renderCategoryControls() {
    categoryTabs.textContent = "";
    const tabData = [
      { name: allCategory, label: "\u5168\u90e8", amount: prompts.length },
      ...categories.map((name) => ({ name, label: name, amount: prompts.filter((prompt) => prompt.category === name).length })),
    ];

    tabData.forEach((category) => {
      const tab = document.createElement("button");
      tab.className = "edeg-prompt-category-tab";
      tab.type = "button";
      tab.dataset.category = category.name;
      tab.dataset.active = String(selectedCategory === category.name);
      tab.textContent = category.label;
      categoryTabs.append(tab);
    });

    fillSelect(categorySelect, categories);
    fillSelect(newCategory, categories);
    categorySelect.value = categories.includes(selectedCategory) ? selectedCategory : generalCategory;
    if (!newCategory.value) newCategory.value = categories.includes(selectedCategory) ? selectedCategory : generalCategory;
  }

  function fillSelect(select, values, selectedValue) {
    const current = selectedValue || select.value;
    select.textContent = "";
    values.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.append(option);
    });
    select.value = values.includes(current) ? current : values[0] || generalCategory;
  }

  function getFilteredPromptEntries() {
    const keyword = searchText.trim().toLowerCase();
    return prompts
      .map((prompt, index) => ({ prompt, index }))
      .filter(({ prompt }) => selectedCategory === allCategory || prompt.category === selectedCategory)
      .filter(({ prompt }) => {
        if (!keyword) return true;
        return [prompt.title, prompt.body, prompt.category].join(" ").toLowerCase().includes(keyword);
      });
  }

  function renderPrompts() {
    const entries = getFilteredPromptEntries();
    count.textContent = entries.length;
    list.textContent = "";

    if (!entries.length) {
      const empty = document.createElement("p");
      empty.className = "edeg-prompt-empty";
      empty.textContent = prompts.length ? "\u6ca1\u6709\u5339\u914d\u7684\u63d0\u793a\u8bcd\u3002" : "\u8fd8\u6ca1\u6709\u4fdd\u5b58\u63d0\u793a\u8bcd\u3002";
      list.append(empty);
      return;
    }

    entries.forEach(({ prompt, index }) => {
      const item = document.createElement("div");
      item.className = "edeg-prompt-item";
      item.dataset.index = String(index);

      if (editingIndex === index) {
        item.classList.add("edeg-prompt-item-editing");
        item.append(createEditForm(prompt, index));
        list.append(item);
        item.querySelector(".edeg-prompt-edit-title").focus();
        return;
      }

      const content = document.createElement("button");
      content.className = "edeg-prompt-insert";
      content.type = "button";
      content.setAttribute("aria-label", `\u4f7f\u7528 ${prompt.title}`);

      const meta = document.createElement("div");
      meta.className = "edeg-prompt-card-meta";

      const title = document.createElement("p");
      title.className = "edeg-prompt-title";
      title.textContent = prompt.title;

      const badge = document.createElement("span");
      badge.className = "edeg-prompt-badge";
      badge.textContent = prompt.category;

      const preview = document.createElement("p");
      preview.className = "edeg-prompt-preview";
      preview.textContent = prompt.body;

      const actions = document.createElement("div");
      actions.className = "edeg-prompt-actions";

      const edit = document.createElement("button");
      edit.className = "edeg-prompt-icon-button edeg-prompt-edit";
      edit.type = "button";
      edit.innerHTML = iconPencil();
      edit.setAttribute("aria-label", `\u7f16\u8f91 ${prompt.title}`);

      const remove = document.createElement("button");
      remove.className = "edeg-prompt-icon-button edeg-prompt-delete";
      remove.type = "button";
      remove.innerHTML = iconTrash();
      remove.setAttribute("aria-label", `\u5220\u9664 ${prompt.title}`);

      meta.append(title, badge);
      content.append(meta, preview);
      actions.append(edit, remove);
      item.append(content, actions);
      list.append(item);
    });
  }

  function createEditForm(prompt, index) {
    const editForm = document.createElement("form");
    editForm.className = "edeg-prompt-edit-form";
    editForm.dataset.index = String(index);

    const editTitle = document.createElement("input");
    editTitle.className = "edeg-prompt-edit-title";
    editTitle.type = "text";
    editTitle.maxLength = 18;
    editTitle.value = prompt.title;
    editTitle.setAttribute("aria-label", "\u7f16\u8f91\u63d0\u793a\u8bcd\u6807\u9898");

    const editCategory = document.createElement("select");
    editCategory.className = "edeg-prompt-edit-category";
    editCategory.setAttribute("aria-label", "\u7f16\u8f91\u63d0\u793a\u8bcd\u5206\u7c7b");
    fillSelect(editCategory, categories, prompt.category);

    const editBody = document.createElement("textarea");
    editBody.className = "edeg-prompt-edit-body";
    editBody.rows = 3;
    editBody.value = prompt.body;
    editBody.setAttribute("aria-label", "\u7f16\u8f91\u63d0\u793a\u8bcd\u5185\u5bb9");

    const editActions = document.createElement("div");
    editActions.className = "edeg-prompt-edit-actions";

    const saveEdit = document.createElement("button");
    saveEdit.className = "edeg-prompt-mini-button edeg-prompt-edit-save";
    saveEdit.type = "submit";
    saveEdit.textContent = "\u4fdd\u5b58";

    const cancelEdit = document.createElement("button");
    cancelEdit.className = "edeg-prompt-mini-button edeg-prompt-edit-cancel";
    cancelEdit.type = "button";
    cancelEdit.textContent = "\u53d6\u6d88";

    editActions.append(saveEdit, cancelEdit);
    editForm.append(editTitle, editCategory, editBody, editActions);
    return editForm;
  }

  function addCategory(name) {
    const nextName = name.trim();
    if (!nextName || categories.includes(nextName)) return;
    categories.push(nextName);
    selectedCategory = nextName;
    categoryName.value = "";
    newCategory.value = nextName;
    savePrompts();
    renderAll();
  }

  function renameCategory(oldName, newName) {
    const nextName = newName.trim();
    if (!nextName || oldName === generalCategory || categories.includes(nextName)) return;
    categories = categories.map((name) => name === oldName ? nextName : name);
    prompts = prompts.map((prompt) => prompt.category === oldName ? { ...prompt, category: nextName } : prompt);
    selectedCategory = selectedCategory === oldName ? nextName : selectedCategory;
    categoryName.value = "";
    savePrompts();
    renderAll();
  }

  function deleteCategory(name) {
    if (name === generalCategory) return;
    categories = categories.filter((category) => category !== name);
    prompts = prompts.map((prompt) => prompt.category === name ? { ...prompt, category: generalCategory } : prompt);
    selectedCategory = selectedCategory === name ? allCategory : selectedCategory;
    categoryName.value = "";
    savePrompts();
    renderAll();
  }

  function iconSearch() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m21 21-4.3-4.3"></path>
        <circle cx="11" cy="11" r="7"></circle>
      </svg>
    `;
  }

  function iconPencil() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20h4.2L19.4 8.8a2 2 0 0 0 0-2.8L18 4.6a2 2 0 0 0-2.8 0L4 15.8V20Z"></path>
        <path d="m14 6 4 4"></path>
      </svg>
    `;
  }

  function iconTrash() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h16"></path>
        <path d="M10 11v6"></path>
        <path d="M14 11v6"></path>
        <path d="M6 7l1 13h10l1-13"></path>
        <path d="M9 7V4h6v3"></path>
      </svg>
    `;
  }

  document.addEventListener("focusin", (event) => {
    const field = getEditableRoot(event.target);
    if (field) showForField(field);
  });

  document.addEventListener("focusout", maybeHideDock);

  document.addEventListener("pointerdown", (event) => {
    const field = getEditableRoot(event.target);
    if (field) showForField(field);
  }, true);

  document.addEventListener("keyup", (event) => {
    const field = getEditableRoot(event.target);
    if (field) showForField(field);
  }, true);

  document.addEventListener("input", (event) => {
    const field = getEditableRoot(event.target);
    if (field) showForField(field);
  }, true);

  window.addEventListener("scroll", schedulePosition, true);
  window.addEventListener("resize", schedulePosition);

  toggle.addEventListener("mousedown", (event) => event.preventDefault());
  toggle.addEventListener("click", () => {
    clearTimeout(hideTimer);
    setState(dock.dataset.state === "expanded" ? "collapsed" : "expanded");
  });

  closeButton.addEventListener("mousedown", (event) => event.preventDefault());
  closeButton.addEventListener("click", () => setState("collapsed"));

  searchInput.addEventListener("input", () => {
    searchText = searchInput.value;
    editingIndex = null;
    renderPrompts();
    schedulePosition();
  });

  categoryTabs.addEventListener("click", (event) => {
    const tab = event.target.closest(".edeg-prompt-category-tab");
    if (!tab) return;
    selectedCategory = tab.dataset.category;
    editingIndex = null;
    renderAll();
  });

  categoryTabs.addEventListener(
    "wheel",
    (event) => {
      if (categoryTabs.scrollWidth <= categoryTabs.clientWidth) return;
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (!delta) return;
      event.preventDefault();
      categoryTabs.scrollLeft += delta;
    },
    { passive: false }
  );

  dock.querySelector(".edeg-prompt-open-add").addEventListener("click", () => {
    openPopover("add");
  });

  dock.querySelector(".edeg-prompt-open-category").addEventListener("click", () => {
    openPopover("category");
  });

  dock.querySelector(".edeg-prompt-popover-close").addEventListener("click", () => {
    closePopover();
  });

  categorySelect.addEventListener("change", () => {
    categoryName.value = categorySelect.value === generalCategory ? "" : categorySelect.value;
  });

  categoryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renameCategory(categorySelect.value, categoryName.value);
  });

  dock.querySelector(".edeg-prompt-category-add").addEventListener("click", () => {
    addCategory(categoryName.value);
  });

  dock.querySelector(".edeg-prompt-category-delete").addEventListener("click", () => {
    deleteCategory(categorySelect.value);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = titleInput.value.trim() || "\u672a\u547d\u540d\u63d0\u793a\u8bcd";
    const body = bodyInput.value.trim();
    if (!body) {
      bodyInput.focus();
      return;
    }

    prompts.unshift({ title, body, category: newCategory.value || generalCategory });
    editingIndex = null;
    savePrompts();
    renderAll();
    form.reset();
    newCategory.value = categories.includes(selectedCategory) ? selectedCategory : generalCategory;
    closePopover();
  });

  list.addEventListener("mousedown", (event) => {
    if (event.target.closest("input, textarea, select")) return;
    event.preventDefault();
  });

  list.addEventListener("submit", (event) => {
    const editForm = event.target.closest(".edeg-prompt-edit-form");
    if (!editForm) return;

    event.preventDefault();
    const index = Number(editForm.dataset.index);
    const title = editForm.querySelector(".edeg-prompt-edit-title").value.trim() || "\u672a\u547d\u540d\u63d0\u793a\u8bcd";
    const body = editForm.querySelector(".edeg-prompt-edit-body").value.trim();
    const category = editForm.querySelector(".edeg-prompt-edit-category").value || generalCategory;
    if (!body) {
      editForm.querySelector(".edeg-prompt-edit-body").focus();
      return;
    }

    prompts[index] = { title, body, category };
    editingIndex = null;
    savePrompts();
    renderAll();
  });

  list.addEventListener("click", (event) => {
    const item = event.target.closest(".edeg-prompt-item");
    if (!item) return;

    const index = Number(item.dataset.index);
    if (event.target.closest(".edeg-prompt-edit")) {
      editingIndex = index;
      renderPrompts();
      return;
    }

    if (event.target.closest(".edeg-prompt-edit-cancel")) {
      editingIndex = null;
      renderPrompts();
      return;
    }

    if (event.target.closest(".edeg-prompt-delete")) {
      prompts.splice(index, 1);
      editingIndex = null;
      savePrompts();
      renderAll();
      return;
    }

    if (event.target.closest(".edeg-prompt-insert")) {
      insertPrompt(prompts[index].body);
    }
  });
})();
