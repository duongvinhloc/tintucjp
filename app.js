const state = {
  index: null,
  selectedDate: null,
  selectedCategory: 'Tất cả',
  search: '',
  dailyData: null,
};

const els = {
  lastUpdate: document.getElementById('lastUpdate'),
  articleCount: document.getElementById('articleCount'),
  dateSelect: document.getElementById('dateSelect'),
  prevDay: document.getElementById('prevDay'),
  nextDay: document.getElementById('nextDay'),
  searchInput: document.getElementById('searchInput'),
  categoryChips: document.getElementById('categoryChips'),
  dayTitle: document.getElementById('dayTitle'),
  daySubtitle: document.getElementById('daySubtitle'),
  statTop: document.getElementById('statTop'),
  statCategories: document.getElementById('statCategories'),
  resultInfo: document.getElementById('resultInfo'),
  newsList: document.getElementById('newsList'),
  emptyState: document.getElementById('emptyState'),
  template: document.getElementById('newsCardTemplate'),
};

const DATA_ROOT = 'data';
const VI_DATE = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full' });

init().catch((error) => {
  console.error(error);
  els.dayTitle.textContent = 'Không tải được dữ liệu';
  els.daySubtitle.textContent = 'Kiểm tra lại file JSON hoặc đường dẫn static hosting.';
  els.emptyState.classList.remove('hidden');
  els.emptyState.textContent = 'Lỗi khi đọc dữ liệu.';
});

async function init() {
  state.index = await fetchJson(`${DATA_ROOT}/index.json`);
  if (!state.index || !Array.isArray(state.index.dates) || state.index.dates.length === 0) {
    throw new Error('index.json phải có mảng dates');
  }

  const latest = state.index.latestDate || state.index.dates[0];
  state.selectedDate = latest;
  populateDateSelect(state.index.dates);
  populateCategoryChips(['Tất cả', ...(state.index.categories || [])]);

  els.searchInput.addEventListener('input', () => {
    state.search = els.searchInput.value.trim().toLowerCase();
    render();
  });

  els.dateSelect.addEventListener('change', async (e) => {
    state.selectedDate = e.target.value;
    await loadSelectedDate();
  });

  els.prevDay.addEventListener('click', async () => {
    moveDate(-1);
  });

  els.nextDay.addEventListener('click', async () => {
    moveDate(1);
  });

  await loadSelectedDate();
}

function populateDateSelect(dates) {
  els.dateSelect.innerHTML = dates
    .map((date) => `<option value="${date}">${formatDateLabel(date)}</option>`)
    .join('');
  els.dateSelect.value = state.selectedDate;
}

function populateCategoryChips(categories) {
  els.categoryChips.innerHTML = categories
    .map((cat) => `
      <button class="chip ${cat === state.selectedCategory ? 'chip--active' : ''}" data-category="${cat}">
        ${cat}
      </button>
    `)
    .join('');

  els.categoryChips.querySelectorAll('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedCategory = button.dataset.category;
      populateCategoryChips(categories);
      render();
    });
  });
}

async function loadSelectedDate() {
  els.dateSelect.value = state.selectedDate;
  const payload = await fetchJson(`${DATA_ROOT}/${state.selectedDate}.json`);
  state.dailyData = payload;
  render();
}

function render() {
  const day = state.dailyData || { articles: [] };
  const articles = Array.isArray(day.articles) ? day.articles : [];

  const filtered = articles.filter((article) => {
    const haystack = [
      article.title,
      article.summary,
      article.source,
      ...(article.tags || []),
      article.category,
    ]
      .join(' ')
      .toLowerCase();

    const categoryMatch = state.selectedCategory === 'Tất cả' || article.category === state.selectedCategory;
    const searchMatch = !state.search || haystack.includes(state.search);
    return categoryMatch && searchMatch;
  });

  els.lastUpdate.textContent = day.generatedAt
    ? `Cập nhật: ${new Date(day.generatedAt).toLocaleString('vi-VN')}`
    : 'Chưa có thời gian cập nhật';
  els.articleCount.textContent = `${filtered.length} tin`;
  els.dayTitle.textContent = formatDateLabel(day.date || state.selectedDate);
  els.daySubtitle.textContent = day.note || 'Danh sách tin được AI tổng hợp và lưu trong file JSON theo ngày.';
  els.statTop.textContent = String(filtered.slice(0, 5).length);
  els.statCategories.textContent = String(new Set(articles.map((a) => a.category).filter(Boolean)).size);
  els.resultInfo.textContent = `${filtered.length}/${articles.length} tin hiển thị`;

  els.newsList.innerHTML = '';
  if (filtered.length === 0) {
    els.emptyState.classList.remove('hidden');
    return;
  }
  els.emptyState.classList.add('hidden');

  filtered.forEach((article) => {
    const node = els.template.content.cloneNode(true);
    node.querySelector('.badge').textContent = article.category || 'Khác';
    node.querySelector('.source').textContent = article.source ? `Nguồn: ${article.source}` : '';
    node.querySelector('.title').textContent = article.title || '(Không có tiêu đề)';
    node.querySelector('.summary').textContent = article.summary || '';
    node.querySelector('.readmore').href = article.url || '#';
    node.querySelector('.readmore').style.pointerEvents = article.url ? 'auto' : 'none';
    node.querySelector('.readmore').style.opacity = article.url ? '1' : '.5';

    const tagsEl = node.querySelector('.tags');
    tagsEl.innerHTML = '';
    (article.tags || []).slice(0, 5).forEach((tag) => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = `#${tag}`;
      tagsEl.appendChild(span);
    });

    els.newsList.appendChild(node);
  });
}

function moveDate(direction) {
  const dates = state.index.dates;
  const currentIndex = dates.indexOf(state.selectedDate);
  const nextIndex = currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= dates.length) return;
  state.selectedDate = dates[nextIndex];
  els.dateSelect.value = state.selectedDate;
  loadSelectedDate();
}

function formatDateLabel(dateStr) {
  const date = new Date(`${dateStr}T00:00:00+09:00`);
  return VI_DATE.format(date);
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Không đọc được ${url}`);
  return res.json();
}
