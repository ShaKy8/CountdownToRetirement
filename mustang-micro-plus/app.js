const PRESETS = [
  [1,"Rock","Driven Deluxe"],[2,"High Gain","Stadium Lead"],[3,"Ambient","Swirling Echoes"],
  [4,"High Gain","Metal 2000"],[5,"High Gain","BB15 Solo"],[6,"Rock","Hey Jimi"],
  [7,"Clean","Twin Trem"],[8,"Ambient","Vibra Drive"],[9,"High Gain","Uber Metal"],
  [10,"Ambient","Octobot"],[11,"Ambient","Harmonic Vibrato"],[12,"High Gain","FBE100"],
  [13,"Ambient","Lavendar Rain"],[14,"Clean","Acoustic Gtr Sim"],[15,"Ambient","Stereo Delay"],
  [16,"Clean","Tweed Sugar"],[17,"Ambient","Wild Nocturne"],[18,"Rock","70s Rock"],
  [19,"Rock","80s Rock"],[20,"Rock","90s Rock"],[21,"Ambient","Echo Dome"],
  [22,"High Gain","Broken"],[23,"Rock","Brit Colour"],[24,"Clean","Super Live"],
  [25,"High Gain","Fired Up Lead"],[26,"Ambient","Year 2290"],[27,"Rock","Boosted Brit"],
  [28,"Ambient","Pigs Can Fly"],[29,"Blues","Tweed Blues"],[30,"Rock","Brit Pop"],
  [31,"Country","Country Twang"],[32,"Surf/Rockabilly","Surfy"],[33,"Rock","Pawn King"],
  [34,"Rock","BB15 Low"],[35,"Rock","BB15 Mid"],[36,"High Gain","BB15 Hi"],
  [37,"Country","Buckaroo"],[38,"Blues","Blues 1951"],[39,"Blues","Derek Champ"],
  [40,"Ambient","Pop Chorus"],[41,"Clean","Jazz Clean"],[42,"High Gain","Super Burn"],
  [43,"Ambient","Dirty Flanger"],[44,"Blues","Cranked Prince"],[45,"Rock","Sustaind"],
  [46,"Blues","Fuzzy Deluxe"],[47,"Blues","Spoonful"],[48,"Clean","65 Twin Reverb"],
  [49,"Clean","65 Dlx Reverb"],[50,"Clean","65 Princ Reverb"],[51,"Clean","57 Champ"],
  [52,"Clean","57 Dlx Fat"],[53,"Blues","Bassman Beef"],[54,"Clean","Silver Tone"],
  [55,"Clean","Brit Stk Clean"],[56,"Clean","DI Funk"],[57,"Surf/Rockabilly","Sun Session"],
  [58,"Clean","57 Twin"],[59,"Ambient","Phased"],[60,"Ambient","Irish Anthems"],
  [61,"Clean","Studio Pre"],[62,"High Gain","Angry Rodent"],[63,"Ambient","Blk Hole Vibe"],
  [64,"Clean","Single Scoop"],[65,"High Gain","Early Eddie"],[66,"Ambient","Vintage Throb"],
  [67,"High Gain","Loud as Leeds"],[68,"Blues","Evil Bassman"],[69,"Ambient","Filtered Echoes"],
  [70,"Surf/Rockabilly","Rock a Billy"]
];

const LS_KEY = "mmp-presets-v1";
let store = { favs: {}, notes: {} };
try { store = Object.assign(store, JSON.parse(localStorage.getItem(LS_KEY) || "{}")); } catch(e) {}
function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(store)); } catch(e) {} }

const GENRES = [...new Set(PRESETS.map(p => p[1]))];
let activeGenre = null, favOnly = false, query = "";

const rowsEl = document.getElementById("rows");
const chipsEl = document.getElementById("genreChips");
const countEl = document.getElementById("count");

GENRES.forEach(g => {
  const b = document.createElement("button");
  b.className = "chip"; b.textContent = g; b.dataset.genre = g;
  b.onclick = () => {
    activeGenre = (activeGenre === g) ? null : g;
    document.querySelectorAll("#genreChips .chip").forEach(c =>
      c.classList.toggle("active", c.dataset.genre === activeGenre));
    render();
  };
  chipsEl.appendChild(b);
});

function genreClass(g) { return "g-" + g.replace(/[ /]/g, "-"); }

function render() {
  rowsEl.innerHTML = "";
  const q = query.trim().toLowerCase();
  let shown = 0;
  PRESETS.forEach(([num, genre, name]) => {
    if (activeGenre && genre !== activeGenre) return;
    if (favOnly && !store.favs[num]) return;
    if (q && !name.toLowerCase().includes(q) && !genre.toLowerCase().includes(q)) return;
    shown++;
    const tr = document.createElement("tr");

    const tdNum = document.createElement("td"); tdNum.className = "num"; tdNum.textContent = num;
    const tdGenre = document.createElement("td"); tdGenre.className = "genre-wrap";
    const badge = document.createElement("span"); badge.className = "genre " + genreClass(genre);
    badge.textContent = genre; tdGenre.appendChild(badge);
    const tdName = document.createElement("td"); tdName.className = "preset-name"; tdName.textContent = name;

    const tdFav = document.createElement("td"); tdFav.className = "favcell";
    const star = document.createElement("button"); star.className = "fav" + (store.favs[num] ? " on" : "");
    star.innerHTML = "&#9733;"; star.setAttribute("aria-label", "favorite " + name);
    star.onclick = () => {
      if (store.favs[num]) delete store.favs[num]; else store.favs[num] = true;
      star.classList.toggle("on"); save();
      if (favOnly) render();
    };
    tdFav.appendChild(star);

    const tdNotes = document.createElement("td"); tdNotes.className = "notes-wrap";
    const ta = document.createElement("textarea"); ta.className = "notes"; ta.rows = 1;
    ta.setAttribute("aria-label", "Notes for " + name);
    ta.placeholder = "Add a note..."; ta.value = store.notes[num] || "";
    ta.addEventListener("input", () => {
      if (ta.value) store.notes[num] = ta.value; else delete store.notes[num];
      save();
    });
    tdNotes.appendChild(ta);

    tr.append(tdNum, tdGenre, tdName, tdFav, tdNotes);
    rowsEl.appendChild(tr);
  });
  const favCount = Object.keys(store.favs).length;
  countEl.textContent = shown + " of 70 shown" + (favCount ? "  \u00b7  " + favCount + " favorites" : "");
}

document.getElementById("search").addEventListener("input", e => { query = e.target.value; render(); });
document.getElementById("favToggle").onclick = e => {
  favOnly = !favOnly; e.currentTarget.classList.toggle("active", favOnly); render();
};

render();
