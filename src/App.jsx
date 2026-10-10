import { useEffect, useState } from "react";

import { generateQuests } from "./api/quests";

import {

  Leaf,

  MapPin,

  Compass,

  Sun,

  Bird,

  Footprints,

  Clock3,

  Sparkles,

  Check,

  ArrowRight,

  TreePine,

  Mountain,

  Menu,

  X,

  RotateCcw,

} from "lucide-react";

import "./App.css";

const missions = [

  {

    id: 1,

    icon: Leaf,

    category: "NATURE DETECTIVE",

    title: "The Leaf Collector",

    description:

      "Discover how much variety hides in plain sight. Find three leaves with completely different shapes.",

    duration: "5 min",

    difficulty: "Easy",

    color: "sage",

    tasks: [

      "Find a leaf with a smooth edge",

      "Find a leaf with a jagged edge",

      "Find a leaf with a completely different shape",

    ],

  },

  {

    id: 2,

    icon: Bird,

    category: "SOUND EXPLORER",

    title: "Listen to the Wild",

    description:

      "Pause the noise of everyday life. Listen carefully and notice two distinct sounds of nature.",

    duration: "5 min",

    difficulty: "Easy",

    color: "sky",

    tasks: [

      "Stand still for one minute",

      "Notice one bird call or insect sound",

      "Identify a second natural sound",

    ],

  },

  {

    id: 3,

    icon: Mountain,

    category: "MINI SCIENTIST",

    title: "Nature Leaves Clues",

    description:

      "Become an urban nature detective. Find evidence of how sunlight, wind, or rain shapes your surroundings.",

    duration: "10 min",

    difficulty: "Medium",

    color: "amber",

    tasks: [

      "Find a sign of sunlight or shade",

      "Look for evidence of wind or rain",

      "Think about how it changed the environment",

    ],

  },

];

const tips = [

  "Look closely. The smallest details can tell the biggest stories.",

  "Take your time. This is an adventure, not a race.",

  "Observe wildlife from a distance. Leave nature as you found it.",

  "Your phone can wait. The world outside cannot be paused.",

];

function App() {
    
useEffect(() => {
  const getPageFromHash = () => {
    const page = window.location.hash
      .replace(/^#\/?/, "")
      .toLowerCase();

    if (page === "my-adventures") return "My adventures";
    if (page === "about") return "About";
    return "Explore";
  };

  const handlePopState = () => {
    setActiveTab(getPageFromHash());
    setActiveMission(null);
    setMenuOpen(false);
  };

  // Keep the current WildQuest view in browser history.
  if (!window.location.hash) {
    window.history.replaceState({ tab: "Explore" }, "", "#explore");
  }

  window.addEventListener("popstate", handlePopState);
  window.addEventListener("hashchange", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
    window.removeEventListener("hashchange", handlePopState);
  };
}, []);


  const [activeMission, setActiveMission] = useState(null);

  const [completed, setCompleted] = useState({});

  const [activeTab, setActiveTab] = useState("Explore");

  const [menuOpen, setMenuOpen] = useState(false);

  const [tipIndex, setTipIndex] = useState(0);

  const [aiLoading, setAiLoading] = useState(false);

  const [aiError, setAiError] = useState("");

  const [aiQuests, setAiQuests] = useState([]);

  const [questDuration, setQuestDuration] = useState(20);

  const [selectedInterests, setSelectedInterests] = useState(["birds", "plants"]);

  const [surroundings, setSurroundings] = useState("city park");

  const displayedMissions = aiQuests.length > 0 ? aiQuests : missions;

  const totalTasks = displayedMissions.reduce(
    (sum, mission) => sum + (completed[mission.id] || []).length,
    0
  );

  const allTasks = displayedMissions.reduce(
    (sum, mission) => sum + mission.tasks.length,
    0
  );

  function toggleTask(missionId, taskIndex) {

    setCompleted((previous) => {

      const existing = previous[missionId] || [];

      const updated = existing.includes(taskIndex)

        ? existing.filter((item) => item !== taskIndex)

        : [...existing, taskIndex];

      return { ...previous, [missionId]: updated };

    });

  }

async function generateMission() {

  setAiLoading(true);

  setAiError("");

  try {

    const result = await generateQuests({
      duration: questDuration,
      interests: selectedInterests.length > 0 ? selectedInterests : ["nature"],
      surroundings,
    });

    const generated = result.quests.map((quest, index) => ({

      id: `ai-${Date.now()}-${index}`,

      icon: [Leaf, Bird, Mountain][index % 3],

      category: "GEMMA AI QUEST",

      title: quest.title,

      description: quest.description,

      duration: quest.duration,

      difficulty: "Easy",

      color: ["sage", "sky", "amber"][index % 3],

      tasks: quest.tasks,

    }));

    setAiQuests(generated);

    setActiveMission(

      generated[Math.floor(Math.random() * generated.length)]

    );

  } catch (error) {

    console.error("WildQuest AI error:", error);

    setAiError(

      "Couldn't generate quests. Check that the backend and Ollama are running, then try again."

    );

  } finally {

    setAiLoading(false);

  }

}

  function resetProgress() {

    setCompleted({});

    setActiveMission(null);

  }

  return (

    <div className="app-shell">

      <header className="topbar">

        <a
  className="brand"
  href="#home"
  onClick={(event) => {
    event.preventDefault();
    setActiveTab("Explore");
    setActiveMission(null);
    setMenuOpen(false);
    window.history.pushState({ tab: "Explore" }, "", "#home");
  }}
>

          <span className="brand-mark">

            <Leaf size={23} strokeWidth={2.2} />

          </span>

          <span>

            <span className="brand-name">wildquest</span>

            <span className="brand-tagline">A LITTLE MORE OUT THERE</span>

          </span>

        </a>

        <button

          className="mobile-menu"

          onClick={() => setMenuOpen(!menuOpen)}

          aria-label="Toggle navigation"

        >

          {menuOpen ? <X /> : <Menu />}

        </button>

        <nav className={menuOpen ? "nav-links nav-open" : "nav-links"}>

          {["Explore", "My adventures", "About"].map((tab) => (

            <button

              key={tab}

              className={`nav-link ${activeTab === tab ? "nav-active" : ""}`}

              onClick={() => {
              setActiveTab(tab);
              setMenuOpen(false);
              setActiveMission(null);
              window.history.pushState({ tab }, "", `#${encodeURIComponent(tab.toLowerCase().replaceAll(" ", "-"))}`);
              }}

            >

              {tab}

            </button>

          ))}

          <span className="offline-pill">

            <span className="status-dot" />

            LOCAL-FIRST

          </span>

        </nav>

      </header>

      <main id="home">

        {activeTab === "About" ? (

          <section className="simple-page">

            <span className="eyebrow">

              <Leaf size={15} /> OUR PHILOSOPHY

            </span>

            <h1>Less scrolling.<br /><span>More discovering.</span></h1>

            <p>

              WildQuest turns ordinary outdoor walks into small adventures.

              Explore your surroundings, notice the little things, and let

              curiosity lead the way. Our goal is to make the screen the

              shortest part of your adventure.

            </p>

            <button className="primary-button" onClick={() => setActiveTab("Explore")}>

              Start exploring <ArrowRight size={17} />

            </button>

          </section>

        ) : activeTab === "My adventures" ? (

          <section className="adventures-page">

            <span className="eyebrow"><Footprints size={15} /> YOUR FIELD JOURNAL</span>

            <h1>Your little victories<span>.</span></h1>

            <p className="section-description">

              Every observation is a reason to step outside again.

            </p>

            <div className="progress-card">

              <div className="progress-top">

                <div>

                  <span className="muted-label">FIELD TASKS COMPLETED</span>

                  <h2>{totalTasks} <span>/ {allTasks}</span></h2>

                </div>

                <span className="progress-icon"><Compass size={26} /></span>

              </div>

              <div className="progress-track">

                <div style={{ width: `${(totalTasks / allTasks) * 100}%` }} />

              </div>

              <p>Small discoveries add up to a bigger world.</p>

            </div>

            <div className="journal-list">

              {displayedMissions.map((mission) => {

                const count = (completed[mission.id] || []).length;

                return (

                  <button

                    className="journal-row"

                    key={mission.id}

                    onClick={() => {
                    setActiveMission(mission);
                    setActiveTab("Explore");
                    }}

                  >

                    <span className={`mini-mission-icon ${mission.color}`}>

                      <mission.icon size={21} />

                    </span>

                    <span className="journal-copy">

                      <strong>{mission.title}</strong>

                      <span>{count} of {mission.tasks.length} tasks complete</span>

                    </span>

                    <ArrowRight size={18} />

                  </button>

                );

              })}

            </div>

            <button className="text-button reset-button" onClick={resetProgress}>

              <RotateCcw size={15} /> Reset demo progress

            </button>

          </section>

        ) : activeMission ? (

          <section className="mission-detail">

            <button className="back-button" onClick={() => setActiveMission(null)}>

              <ArrowRight size={16} className="back-arrow" /> All adventures

            </button>

            <div className={`detail-art ${activeMission.color}`}>

              <div className="detail-art-circle"><activeMission.icon size={62} /></div>

              <span className="art-sun" />

              <span className="art-hill art-hill-one" />

              <span className="art-hill art-hill-two" />

              <span className="art-grass"><TreePine size={48} /><TreePine size={65} /></span>

            </div>

            <div className="detail-content">

              <span className="eyebrow">{activeMission.category}</span>

              <h1>{activeMission.title}<span>.</span></h1>

              <p>{activeMission.description}</p>

              <div className="detail-meta">

                <span><Clock3 size={16} /> {activeMission.duration}</span>

                <span><Sparkles size={16} /> {activeMission.difficulty}</span>

              </div>

              <div className="task-panel">

                <h2>Your field checklist</h2>

                <p>Complete these tasks while exploring outdoors.</p>

                {activeMission.tasks.map((task, index) => {

                  const checked = (completed[activeMission.id] || []).includes(index);

                  return (

                    <button

                      key={task}

                      className={`task-row ${checked ? "task-checked" : ""}`}

                      onClick={() => toggleTask(activeMission.id, index)}

                    >

                      <span className="task-checkbox">{checked && <Check size={16} />}</span>

                      <span>{task}</span>

                    </button>

                  );

                })}

                {(completed[activeMission.id] || []).length === activeMission.tasks.length && (

                  <div className="success-note">

                    <Sparkles size={19} />

                    <span><strong>Quest complete!</strong><br />You made time to notice the world.</span>

                  </div>

                )}

              </div>

              <p className="screen-reminder">

                <Sun size={17} /> Now put your phone away and enjoy the adventure.

              </p>

            </div>

          </section>

        ) : (

          <>

            <section className="hero">

              <div className="hero-copy">

                <span className="eyebrow">

                  <span className="eyebrow-dot" /> YOUR NEXT ADVENTURE STARTS HERE

                </span>

                <h1>

                  The world is<br />

                  your <span className="handwritten">playground.</span>

                </h1>

                <p className="hero-description">

                  Tiny missions. Fresh air. Unexpected discoveries.

                  Let a little curiosity lead you somewhere wonderful.

                </p>

                <div className="hero-actions">

                  <button className="primary-button" onClick={generateMission} disabled={aiLoading}>

                    {aiLoading ? "Generating quests..." : "Find my next quest"} <ArrowRight size={18} />

                  </button>

                  <span className="hero-caption"><Leaf size={15} /> Made for the real world</span>

                </div>

                <div className="hero-stats">

                  <div><strong>5–20</strong><span>MINUTE QUESTS</span></div>

                  <div className="stat-divider" />

                  <div><strong>0</strong><span>SCREENS NEEDED OUTSIDE</span></div>

                  <div className="stat-divider" />

                  <div><strong>∞</strong><span>THINGS TO DISCOVER</span></div>

                </div>

              </div>

              <div className="hero-visual">

                <div className="visual-note note-top"><Sun size={16} /> A little sunshine goes a long way</div>

                <div className="nature-scene">

                  <div className="scene-sun" />

                  <div className="scene-cloud cloud-one" />

                  <div className="scene-cloud cloud-two" />

                  <div className="scene-mountain mountain-back" />

                  <div className="scene-mountain mountain-front" />

                  <div className="scene-hill hill-back" />

                  <div className="scene-hill hill-front" />

                  <div className="scene-tree tree-left"><TreePine /></div>

                  <div className="scene-tree tree-right"><TreePine /></div>

                  <div className="scene-person"><Footprints size={45} /></div>

                  <div className="scene-flower flower-one">✿</div>

                  <div className="scene-flower flower-two">✿</div>

                  <div className="scene-label"><Compass size={16} /> THE GREAT OUTSIDE</div>

                </div>

                <div className="visual-note note-bottom"><MapPin size={16} /> Adventure is closer than you think</div>

              </div>

            </section>

            <section className="quest-section">

              <div className="section-heading">

                <div>

                  <span className="eyebrow">A WORLD WAITING FOR YOU</span>

                  <h2>Pick a little adventure<span>.</span></h2>

                  <p className="section-description">

                    No big plans needed. Just step outside and see what you find.

                  </p>

                </div>

                <button className="text-button" onClick={generateMission} disabled={aiLoading}>

                  {aiLoading ? "Generating..." : "Surprise me"} <Sparkles size={16} />

                </button>

              </div>

              <div className="quest-preferences" aria-label="Customize your AI quests">

                <div className="preference-field">

                  <label htmlFor="quest-duration">Available time</label>

                  <select

                    id="quest-duration"

                    value={questDuration}

                    onChange={(event) => setQuestDuration(Number(event.target.value))}

                  >

                    <option value={5}>5 minutes</option>

                    <option value={10}>10 minutes</option>

                    <option value={20}>20 minutes</option>

                    <option value={30}>30 minutes</option>

                    <option value={45}>45 minutes</option>

                    <option value={60}>60 minutes</option>

                  </select>

                </div>

                <div className="preference-field surroundings-field">

                  <label htmlFor="quest-surroundings">Where are you exploring?</label>

                  <select

                    id="quest-surroundings"

                    value={surroundings}

                    onChange={(event) => setSurroundings(event.target.value)}

                  >

                    <option value="city park">City park</option>

                    <option value="garden">Garden</option>

                    <option value="neighbourhood">Neighbourhood</option>

                    <option value="beach">Beach</option>

                    <option value="forest or nature trail">Forest or nature trail</option>

                    <option value="school or college campus">School or college campus</option>

                    <option value="backyard">Backyard</option>

                  </select>

                </div>

                <div className="preference-field interests-field">

                  <span className="preference-label">What interests you?</span>

                  <div className="interest-options">

                    {[

                      ["birds", "Birds"],

                      ["plants", "Plants"],

                      ["insects", "Insects"],

                      ["clouds", "Clouds"],

                      ["patterns", "Natural patterns"],

                      ["sounds", "Nature sounds"],

                    ].map(([value, label]) => (

                      <label className="interest-chip" key={value}>

                        <input

                          type="checkbox"

                          checked={selectedInterests.includes(value)}

                          onChange={() => {

                            setSelectedInterests((current) =>

                              current.includes(value)

                                ? current.filter((interest) => interest !== value)

                                : [...current, value]

                            );

                          }}

                        />

                        <span>{label}</span>

                      </label>

                    ))}

                  </div>

                </div>

                {selectedInterests.length === 0 && (

                  <p className="preference-hint">No interests selected — Gemma will create general nature quests.</p>

                )}

              </div>

              <div className="mission-grid">

                {(aiQuests.length > 0 ? aiQuests : missions).map((mission, index) => {

                  const Icon = mission.icon;

                  const count = (completed[mission.id] || []).length;

                  return (

                    <article className="mission-card" key={mission.id}>

                      <div className={`mission-art ${mission.color}`}>

                        <span className="mission-number">0{index + 1}</span>

                        <span className="mission-art-icon"><Icon size={40} strokeWidth={1.5} /></span>

                        <span className="art-decoration art-decoration-one" />

                        <span className="art-decoration art-decoration-two" />

                        <span className="mission-duration"><Clock3 size={13} /> {mission.duration}</span>

                      </div>

                      <div className="mission-body">

                        <span className="mission-category">{mission.category}</span>

                        <h3>{mission.title}</h3>

                        <p>{mission.description}</p>

                        <div className="mission-footer">

                          <span className="difficulty">{mission.difficulty}</span>

                          <button

                            className="card-button"

                            onClick={() => setActiveMission(mission)}

                          >

                            {count === mission.tasks.length ? "Completed" : "Explore quest"}

                            <ArrowRight size={16} />

                          </button>

                        </div>

                      </div>

                    </article>

                  );

                })}

              </div>

              {aiLoading && (

                <p className="ai-status" role="status">

                  <Sparkles size={18} />

                  Gemma is dreaming up your next adventures...

                </p>

              )}

              {aiError && (

                <p className="ai-error" role="alert">

                  {aiError}

                </p>

              )}

            </section>

            <section className="mindful-banner">

              <div className="mindful-icon"><Sun size={26} /></div>

              <div className="mindful-copy">

                <span className="eyebrow">A LITTLE REMINDER</span>

                <h2>{tips[tipIndex]}</h2>

                <p>Take only memories. Leave only footprints.</p>

              </div>

              <button

                className="tip-button"

                aria-label="Get another tip"

                onClick={() => setTipIndex((tipIndex + 1) % tips.length)}

              >

                <RotateCcw size={19} />

              </button>

            </section>

          </>

        )}

      </main>

      <footer className="footer">

        <a className="footer-brand" href="#home" onClick={() => {

          setActiveMission(null);

          setActiveTab("Explore");

        }}>

          <Leaf size={18} /> wildquest

        </a>

        <span>Built for curious minds & wandering feet.</span>

        <span className="footer-open"><span className="status-dot" /> OPEN-AI INSPIRED. OUTDOOR-OBSESSED.</span>

      </footer>

    </div>

  );

}

export default App;
