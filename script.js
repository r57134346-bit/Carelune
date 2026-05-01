const fallbackImage =
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80";

const postGrid = document.querySelector("#postGrid");
const searchInput = document.querySelector("#searchInput");
const filterButtons = document.querySelectorAll(".filter-chip");
const commentStorageKey = "careLuneComments";

let activeCategory = "all";
let posts = [];
let comments = loadComments();

async function loadPosts() {
  try {
    const response = await fetch("data/products.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Products file could not be loaded.");
    }

    const data = await response.json();
    posts = Array.isArray(data.products) ? data.products : [];
  } catch {
    posts = Array.isArray(window.careLuneProducts) ? window.careLuneProducts : [];
  }

  renderPosts();
}

function loadComments() {
  const saved = localStorage.getItem(commentStorageKey);
  if (!saved) {
    return {};
  }

  try {
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveComments() {
  localStorage.setItem(commentStorageKey, JSON.stringify(comments));
}

function renderPosts() {
  const query = searchInput.value.trim().toLowerCase();
  const visiblePosts = posts.filter((post) => {
    const searchable = `${post.title} ${post.category} ${post.summary} ${post.bestFor}`.toLowerCase();
    const matchesSearch = searchable.includes(query);
    const matchesCategory = activeCategory === "all" || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  postGrid.innerHTML = "";

  if (!visiblePosts.length) {
    postGrid.innerHTML = '<div class="empty-state">No product posts match this search yet.</div>';
    return;
  }

  visiblePosts.forEach((post) => {
    const postId = getPostId(post);
    const postComments = comments[postId] || [];
    const card = document.createElement("article");
    card.className = "post-card";
    card.dataset.postId = postId;
    card.innerHTML = `
      <img src="${escapeAttribute(post.image || fallbackImage)}" alt="${escapeAttribute(post.title)}">
      <div class="post-body">
        <div class="post-meta">
          <span class="category-pill">${escapeHtml(post.category)}</span>
          <span>${escapeHtml(post.date)}</span>
        </div>
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.summary)}</p>
        <span class="best-for">Best for: ${escapeHtml(post.bestFor || "Everyday use")}</span>
        <a class="amazon-link" href="${escapeAttribute(post.link)}" target="_blank" rel="sponsored noopener noreferrer">
          View product
        </a>
        <section class="comment-box" aria-label="Comments for ${escapeAttribute(post.title)}">
          <h4>Comments</h4>
          <div class="comment-list">
            ${renderComments(postComments)}
          </div>
          <form class="comment-form" data-post-id="${escapeAttribute(postId)}">
            <label>
              Your comment
              <textarea name="comment" maxlength="180" rows="3" required placeholder="Share your thoughts about this product"></textarea>
            </label>
            <button class="secondary-button" type="submit">Post comment</button>
          </form>
        </section>
      </div>
    `;
    postGrid.append(card);
  });
}

function renderComments(postComments) {
  if (!postComments.length) {
    return '<p class="no-comments">No comments yet.</p>';
  }

  return postComments
    .map(
      (comment) => `
        <article class="comment-item">
          <p>${escapeHtml(comment.text)}</p>
          <span>${escapeHtml(comment.date)}</span>
        </article>
      `
    )
    .join("");
}

function getPostId(post) {
  return `${post.title}-${post.category}-${post.date}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    renderPosts();
  });
});

searchInput.addEventListener("input", renderPosts);

postGrid.addEventListener("submit", (event) => {
  if (!event.target.classList.contains("comment-form")) {
    return;
  }

  event.preventDefault();
  const form = event.target;
  const postId = form.dataset.postId;
  const commentText = form.elements.comment.value.trim();
  if (!commentText) {
    return;
  }

  const comment = {
    text: commentText,
    date: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date())
  };

  comments[postId] = [...(comments[postId] || []), comment];
  saveComments();
  form.reset();
  renderPosts();
});

loadPosts();
