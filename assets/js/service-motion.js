const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealTargets = [
  ".hero-shell",
  ".hero-point",
  ".service-card",
  ".panel",
  ".gallery-card",
  ".stat-card",
  ".cta-panel"
];

document.body.classList.add("js-ready");

const nodes = document.querySelectorAll(revealTargets.join(", "));
nodes.forEach((node) => node.classList.add("reveal-target"));

if (!prefersReducedMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  nodes.forEach((node) => observer.observe(node));

  const shell = document.querySelector(".hero-shell");
  if (shell) {
    shell.addEventListener("mousemove", (event) => {
      const rect = shell.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      shell.style.transform = `perspective(1400px) rotateX(${(-y * 2.8).toFixed(2)}deg) rotateY(${(x * 3.6).toFixed(2)}deg)`;
    });
    shell.addEventListener("mouseleave", () => {
      shell.style.transform = "";
    });
  }
} else {
  nodes.forEach((node) => node.classList.add("is-visible"));
}

document.querySelectorAll(".service-stage").forEach((stage) => {
  if (prefersReducedMotion) {
    return;
  }

  const cards = stage.querySelectorAll(".stage-card");
  stage.addEventListener("mousemove", (event) => {
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    cards.forEach((card, index) => {
      const depth = index === 0 ? 1 : 1.45;
      const rotateY = x * 8 * depth;
      const rotateX = -y * 7 * depth;
      const lift = index === 0 ? -6 : -12;
      const baseRotate = card.classList.contains("stage-card-main") ? -6 : 7;
      card.style.transform = `rotate(${baseRotate}deg) translate3d(${x * 10 * depth}px, ${y * 8 * depth + lift}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  });

  stage.addEventListener("mouseleave", () => {
    cards.forEach((card) => {
      if (card.classList.contains("stage-card-main")) {
        card.style.transform = "rotate(-6deg)";
      } else {
        card.style.transform = "rotate(7deg) translateZ(30px)";
      }
    });
  });
});
