# ASIP-SQUAD

### Website Link: https://ashkanaleshams.github.io/ASIP-SQUAD/
### [Demo Video](https://drive.google.com/file/d/1sD6C7_CUIIZFH9CJBej8aCvpp7kAzSyW/view?usp=sharing)

## Overview

The data story displays 5 visualizations to model different LLM datasets. Each of the visualizations can be interacted with for data exploration.

## Data Sources

The data we used can be found in `data/`

- [Barriers data source](https://deeperinsights.com/ai-blog/the-unspoken-challenges-of-large-language-models   ):
  - [barriers.json](https://github.com/AshkanAleshams/ASIP-SQUAD/blob/4ad0ac0bf12014f61d9e772e89ce62e8ae9671d1/data/barriers.json)
  - Used ChatGPT to generate a json dataset with the information from the article 
- [Open LLM data](https://github.com/JonathanChavezTamales/LLMStats):
  - [open_data.json](https://github.com/AshkanAleshams/ASIP-SQUAD/blob/4ad0ac0bf12014f61d9e772e89ce62e8ae9671d1/data/open_data.json)
- [LLM Stats data](https://huggingface.co/datasets/open-llm-leaderboard/contents):
  - [LLMStats_ChavezTamales_Data.json](https://github.com/AshkanAleshams/ASIP-SQUAD/blob/4ad0ac0bf12014f61d9e772e89ce62e8ae9671d1/data/LLMStats_ChavezTamales_Data.json)

## Implementation

Our visualization implementations can be found in `js/`. Each visualization has its own class, with `main.js` handling the data loading and visualization initialization.

### Features

- Every visualization has a tooltip that is revealed on hovering over the data or nodes
- The visualizations have select button that allows you to change the data of interest
- A toggle sort button is available for the visualizations to sort and unsort the data
- The last visualization provides a data slider, allowing the user to select data within a specific range and a tooltip to define some of the terms

## Libraries and Credits

Added libraries:
- dot-nav: https://www.cssscript.com/one-page-scroll-dot-nav/ for a responsive side nav bar
- GSAP animations: https://gsap.com/ for scroll timing
- Lenis: https://github.com/darkroomengineering/lenis for smooth scroll
- typed.js https://github.com/mattboldt/typed.js for typing effects
- Bootstrap 5: https://getbootstrap.com/ for styling

SVG Assets:
- Svg lock source: https://www.svgrepo.com/svg/136946/lock 
- Svg key source: https://www.svgrepo.com/svg/535465/key-skeleton

Found in [/assets](https://github.com/AshkanAleshams/ASIP-SQUAD/blob/main/assets) 

Downloaded libraries and their usages are found in [/libs](https://github.com/AshkanAleshams/ASIP-SQUAD/tree/main/libs)

Implementation for scroll and typing effects can be found in [animations.js](https://github.com/AshkanAleshams/ASIP-SQUAD/blob/main/libs/animations.js)
