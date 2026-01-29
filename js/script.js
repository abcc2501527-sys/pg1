let STORAGE_KEY = "lifehacks";
let entries = [];

function init() {
  let addBtn = document.getElementById("addBtn");
  console.log(addBtn);

  loadFromStorage();
  renderList();
}

function loadFromStorage() {
  let raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      entries = JSON.parse(raw);
    }
    catch (e) {
      console.error("storage parse error", e);
      entries = [];
    }
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function onAdd() {
  let contentEl = document.getElementById("content");
  let linkEl = document.getElementById("link");
  let categoryEl = document.getElementById("category");

  let content = contentEl.value.trim();
  let link = linkEl.value.trim();
  let category = categoryEl.value;

  if (!content) {
    contentEl.focus();
    return;
  }

  let entry = {
    id: Date.now().toString(),
    date: new Date().toISOString().slice(0, 10),
    content: content,
    link: link,
    category: category,
    createdAt: Date.now()
  };

  entries.unshift(entry);
  console.log(entries);
  saveToStorage();
  renderList();
  document.getElementById("entryForm").reset();
  contentEl.focus();
}

function onClearAll() {
  if (!confirm("本当に全て削除しますか？")) {
    return;
  }
  entries = [];
  saveToStorage();
  renderList();
}

function renderList() {
  let list = document.getElementById("list");
  list.innerHTML = "";
  let filter = document.getElementById("filterCategory").value;
  let filtered = (filter === "all") ? entries : entries.filter(e => e.category === filter);

  if (filtered.length === 0) {
    list.innerHTML = `<div class="card" style="text-align:center;color:var(--muted)">記録がありません。追加してみましょう。</div>`;
  }
  else {
    let tpl = document.getElementById("cardTemplate");
    filtered.forEach(e => {
      let node = tpl.content.cloneNode(true);
      let article = node.querySelector(".card");
      article.dataset.id = e.id;

      article.querySelector(".date").textContent = e.date;
      article.querySelector(".category").textContent = e.category;
      article.querySelector(".content").textContent = e.content;

      let linkEl = article.querySelector(".link");
      if (e.link) {
        linkEl.href = e.link;
        linkEl.style.display = "inline-block";
      } else {
        linkEl.style.display = "none";
      }

      let delBtn = node.querySelector('.del');
      delBtn.addEventListener('click', () => {
        if (!confirm('この記録を削除しますか？')) return;
        deleteEntry(e.id);
      });

      let editBtn = node.querySelector('.edit');
      editBtn.addEventListener('click', () => {
        openEditDialog(e.id);
      });

      list.appendChild(node);
    });
  }

  document.getElementById("count").textContent = `記録件数: ${entries.length}`;
}

function deleteEntry(id) {
  entries = entries.filter(x => x.id !== id);
  saveToStorage();
  renderList();
}

function openEditDialog(id) {
  let entry = entries.find(x => x.id === id);
  if (!entry) {
    return alert("該当の記録が見つかりません");
  }

  let newContent = prompt("内容を編集", entry.content);
  if (newContent === null) {
    return;
  }
  let newLink = prompt("リンクを編集", entry.link || "");
  if (newLink === null) {
    return;
  }
  let newCategory = prompt("カテゴリを編集（学習/便利/生活/仕事）", entry.category);
  if (newCategory === null) {
    return;
  }

  entry.content = newContent.trim() || entry.content;
  entry.link = newLink.trim();
  entry.category = newCategory || entry.category;
  saveToStorage();
  renderList();
}


window.onDelete = function (el) {
  let card = el.closest(".card");
  let id = card.dataset.id;
  if (!confirm("この記録を削除しますか？")) {
    return;
  }
  deleteEntry(id);
}

window.onEdit = function (el) {
  let card = el.closest(".card");
  let id = card.dataset.id;
  openEditDialog(id);
}

window.addEventListener("DOMContentLoaded", init);