window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", "UA-34564934-1");

const max = document.getElementById("comics").childElementCount - 1;
let current = max;
if (location.hash) {
    const hash = parseInt(location.hash.substring(1));
    if (hash < 0 || hash > max) {
        location.hash = ""; // reset
    } else {
      current = hash;
    }
}

var app = Vue.createApp({
    data() {
      return {
        current,
        max,
        min: 0,
        showInfo: false,
        showShare: false,
        copied: false,
      };
    },
    computed: {
        shareUrl: function () {
            return `${location.href.split("#")[0]}#${this.current}`;
        },
        twitterUrl: function () {
            return `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                this.shareUrl
            )}`;
        },
        facebookUrl: function () {
            return `http://www.facebook.com/sharer.php?u=${encodeURIComponent(
                this.shareUrl
            )}`;
        },
        linkedinUrl: function () {
            return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                this.shareUrl
            )}`;
        },
    },
    methods: {
        copy: function ({ target }) {
            gtag("event", "bit_copy", {
                event_category: `Bits:${this.current}`,
                event_label: "Copy",
            });
            /* Select the text field */
            target.select();
            target.setSelectionRange(0, 99999); /* For mobile devices */

            /* Copy the text inside the text field */
            document.execCommand("copy");
            this.copied = true;
            setTimeout(() => {
                this.copied = false;
            }, 700);
        },
        newer: function () {
            gtag("event", "bit_newer", {
                event_category: `Bits:${this.current}`,
                event_label: "Newer",
            });
            location.hash = this.current = this.current + 1;
        },
        older: function () {
            gtag("event", "bit_older", {
                event_category: `Bits:${this.current}`,
                event_label: "Older",
            });
            location.hash = this.current = this.current - 1;
        },
        first: function () {
            gtag("event", "bit_first", {
                event_category: `Bits:${this.current}`,
                event_label: "First",
            });
            location.hash = this.current = this.min;
        },
        last: function () {
            gtag("event", "bit_last", {
                event_category: `Bits:${this.current}`,
                event_label: "Last",
            });
            location.hash = this.current = this.max;
        },
        cancelShare: function () {
            gtag("event", "bit_cancel_share", {
                event_category: `Bits:${this.current}`,
                event_label: "Cancel",
            });
            this.showShare = false;
        },
        share: function () {
            const canShare = navigator && navigator.share !== undefined;
            gtag("event", "bit_share", {
                event_category: `Bits:${this.current}`,
                event_label: "Share",
                event_value: canShare,
            });
            if (canShare) {
                navigator
                    .share({
                        url: this.shareUrl,
                    })
                    .then(() => console.log("Successful share"))
                    .catch((error) => console.error("Error sharing:", error));
            } else {
                this.showShare = true;
            }
        },
        cancelInfo: function () {
            gtag("event", "bit_cancel_info", {
                event_category: `Bits:${this.current}`,
                event_label: "Info",
            });
            this.showInfo = false;
        },
        info: function () {
            gtag("event", "bit_info", {
                event_category: `Bits:${this.current}`,
                event_label: "Info",
            });
            this.showInfo = true;
        },
    },
});
app.directive("lazyload-video", {
  beforeMount(el){
      function loadVideo() {
        if (el.nodeName !== "VIDEO") throw new Error("lazyload-video directive must be applied to a <video> element");
        el.addEventListener("canplay", () => 
          el.classList.add("loaded")
        );
          el.addEventListener("error", (e) =>
              console.error("lazy video", e)
          );
          el.autoplay = true;
          el.loop = true;
          el.muted = true; // muted videos can only autoplay
          el.preload = "auto";
          el.src = el.dataset.src;
          el.poster = el.dataset.poster;
          
      }
      function handleIntersect(entries, observer) {
          entries.forEach((entry) => {
              if (entry.isIntersecting) {
                loadVideo();
                  observer.unobserve(el);
              }
          });
      }

      function createObserver() {
          const options = {
              root: null,
              threshold: "0",
          };
          const observer = new IntersectionObserver(handleIntersect, options);
          observer.observe(el);
      }
      if (window["IntersectionObserver"]) {
          createObserver();
      } else {
        loadVideo();
      }
  }
});
app.directive("lazyload-img", {
  beforeMount(el){
      function loadImage() {
        if (el.nodeName !== "IMG") throw new Error("lazyload-img directive must be applied to a <img> element");
        el.addEventListener("load", () => el.classList.add("loaded"));
        el.addEventListener("error", (e) =>
          console.error("image load", e)
        );
        el.src = el.dataset.url;
      }
      function handleIntersect(entries, observer) {
          entries.forEach((entry) => {
              if (entry.isIntersecting) {
                  loadImage();
                  observer.unobserve(el);
              }
          });
      }
      function createObserver() {
          const options = {
              root: null,
              threshold: "0",
          };
          const observer = new IntersectionObserver(handleIntersect, options);
          observer.observe(el);
      }
      if (window["IntersectionObserver"]) {
          createObserver();
      } else {
          loadImage();
      }
  }
});
app.component("figure", {
  props: ["id"],
  computed: {
      fileName() {
        return `0000${this.id}`.slice(-4);
      },
      alt: function () {
          return `Bits Comic: Number ${this.id}`;
      },
      poster: function () {
        return `img/${this.fileName}.png`;
      },
      source: function () {
          return `img/${this.fileName}.mp4`;
      },
  },
});

app.component("figure-video", {
  props: ["figureId","hasAudio"],
  data() {
    return {
      isMuted: true
    };
  },
  computed: {
      fileName() {
        return `0000${this.figureId}`.slice(-4);
      },
      alt: function () {
          return `Bits Comic: Number ${this.figureId}`;
      },
      poster: function () {
        return `img/${this.fileName}.png`;
      },
      source: function () {
        return `img/${this.fileName}.mp4`;
      },
      subtitle: function() {
        return `img/${this.fileName}.vtt`;
      },
  },
  methods: {
    unmute() {
      this.isMuted = this.$refs.video.muted = !this.$refs.video.muted;
    }
  },
  template: `<video ref="video" v-lazyload-video class="loader" :data-src="source" :data-poster="poster" :alt="alt" >
      <track label="English" kind="subtitles" srclang="en" v-if="hasAudio" :src="subtitle" default>
    </video>
    <button class="nav figure-video__unmute" v-if="hasAudio" v-on:click="unmute">
      <mute-icon v-if="!isMuted" /> <span v-if="!isMuted">Mute</span>
      <unmute-icon v-if="isMuted"/> <span v-if="isMuted">Unmute</span>
    </button>`,
});
app.component("mute-icon", {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6"/></svg>`
});
app.component("unmute-icon", {
  template: `<svg 
    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24" height="24" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
  <g transform="rotate(180 50 50)"><rect x="12.5" y="15" width="15" height="40" fill="currentColor">
  <animate attributeName="height" values="50;70;30;50" keyTimes="0;0.33;0.66;1" dur="1s" repeatCount="indefinite" calcMode="spline" keySplines="0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1" begin="-0.4s"></animate>
  </rect><rect x="32.5" y="15" width="15" height="40" fill="currentColor">
  <animate attributeName="height" values="50;70;30;50" keyTimes="0;0.33;0.66;1" dur="1s" repeatCount="indefinite" calcMode="spline" keySplines="0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1" begin="-0.2s"></animate>
  </rect><rect x="52.5" y="15" width="15" height="40" fill="currentColor">
  <animate attributeName="height" values="50;70;30;50" keyTimes="0;0.33;0.66;1" dur="1s" repeatCount="indefinite" calcMode="spline" keySplines="0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1" begin="-0.6s"></animate>
  </rect><rect x="72.5" y="15" width="15" height="40" fill="currentColor">
  <animate attributeName="height" values="50;70;30;50" keyTimes="0;0.33;0.66;1" dur="1s" repeatCount="indefinite" calcMode="spline" keySplines="0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1" begin="-1s"></animate>
  </rect></g>
  </svg>`
});
 
app.component("figure-image", {
  props: ["figureId", "fileType"],
  computed: {
      alt: function () {
          return `Bits Comic: Number ${this.figureId}`;
      },
      source: function () {
          return `img/${("0000" + this.figureId).slice(-4)}.${this.fileType ?? "png"}`;
      },
  },
  template: `<img v-lazyload-img class="loader" :data-url="source" :alt="alt" />`,
});
app.component("figure-set", {
  props: {
    figureId: String,
    isFirstVideo: Boolean,
    count: Number
  },
  data: function() {
    return {
      current: 0,
    }
  },
  computed: {
      style: function() {
        return { width: `${this.count}00%` };
      },
      alt: function () {
          return `Bits Comic: Number ${this.figureId}`;
      },
      sources: function () {
        return Array(this.count)
          .fill()
          .map((c,i)=> ( i === 0 && this.isFirstVideo ? {
            poster: `img/${("0000" + this.figureId).slice(-4)}.${i}.png`,
            source: `img/${("0000" + this.figureId).slice(-4)}.${i}.mp4`,
          }:{
            source: `img/${("0000" + this.figureId).slice(-4)}.${i}.png`,
          }));
      },
  },
  methods: {
    next: function () {
      this.current++;
      if (this.current >= this.count) {
        this.current = 0; //reset
      }
      const newPos = this.$refs.set.clientWidth * this.current;
      this.$refs.set.scrollTo(newPos,0)
    }
  },
  template: `<div class="figure-set__container"><div class="figure-set" ref="set" ><ol :style="style">
      <li v-for="source in sources">
        <video v-if="source.poster" v-lazyload-video class="loader" :data-src="source.source" :data-poster="poster" :alt="alt" />
        <img v-if="!source.poster" v-lazyload-img class="loader" :data-url="source.source" :alt="alt" />
      </li>
    </ol></div><button class="nav" type="button" v-on:click="next" >
     <span>Next</span> <next-icon/>
    </button></div>`,
});

app.component("next-icon", {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7"/></svg>`,
});
app.component("figure-time", {
  props: ["title", "datetime"],
  template: `<time v-bind:title="title" v-bind:datetime="datetime" >{{title}}</time>`,
});
app.component("figure-caption", {
  props: ["figureId"],
  data: function () {
      return {
          editMode: false,
          value: null,
      };
  },
  computed: {
      link: function () {
          if (!this.value) {
              return "#";
          }
          const subject = encodeURIComponent(
              `Bits Caption for ${this.figureId}`
          );
          const body = encodeURIComponent(this.value);
          return `mailto:shan@naziripour.com?subject=${subject}&body=${body}`;
      },
  },
  methods: {
      edit: function () {
          gtag("event", "bit_edit", {
              event_category: `Bits:${this.figureId}`,
              event_label: "Edit",
          });
          this.editMode = true;

          // Focus the component, but we have to wait
          // so that it will be showing first.
          Vue.nextTick(
              function () {
                  // DOM updated
                  this.$refs.body.focus();
              }.bind(this)
          );
      },
      send: function () {
          gtag("event", "bit_send", {
              event_category: `Bits:${this.figureId}`,
              event_label: this.value,
          });
          this.editMode = false;
      },
      cancel: function () {
          gtag("event", "bit_cancel", {
              event_category: `Bits:${this.figureId}`,
              event_label: "Cancel",
          });
          this.value = null;
          this.editMode = false;
      },
  },
  template: `<figcaption>
      <div class="form" v-if="editMode">
        <textarea ref="body" v-model="value" placeholder="Your Caption" />
        <a class="button" v-on:click="send" :disabled="value === null" v-bind:href="link" target="_blank" title="Send your caption to me!">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        <span>Send</span></a>
        <button class="nav" type="button" v-on:click="cancel" >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"/></svg>
        <span>Cancel</span></button>
      </div>
      <div v-else>
          <span v-if="value">
            {{value}}
          </span>
          <span v-else>
            <slot></slot>
          </span>
          <button v-on:click="edit" title="Edit">✐</button>
          <i v-if="value">(edited)</i>
      </div>
    </figcaption>`,
});

app.mount("#app");