// Title animations
var typed = new Typed(".typing", {
    strings: ["Visualizing the LLM Industry"],
    typeSpeed: 40,
    backSpeed: 30,
    startDelay: 500,
    backDelay: 500,
});

dotNav("section", "easeInOutQuint");

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// pin the page until all content below apears
let tl = gsap.timeline({
    scrollTrigger: {
        trigger: "#page1",
        start: "top top",
        end: "bottom top",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
    },
});
//reveal content
tl.from("#main-content", {
    opacity: 0,
    y: 50,
    duration: 1,
});

gsap.utils.toArray(".animate-on-scroll").forEach((section) => {
    gsap.from(section, {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "top 50%",
            scrub: true,
            toggleActions: "play reverse play reverse",
        },
    });
});

const lenis = new Lenis();

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);


// enable bootstrap tooltips
let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})