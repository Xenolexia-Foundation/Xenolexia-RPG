<template>
  <div class="lexicon-panel">
    <rpg-window :fullWidth="true" height="100%" class="lexicon-window">
      <div class="lexicon-header">
        <h2>Lexicon</h2>
        <p class="subtitle">{{ vocabulary.length }} words · {{ dueCount }} due for review</p>
      </div>
      <div class="lexicon-list" v-if="vocabulary.length">
        <div
          v-for="item in vocabulary"
          :key="item.id"
          class="lexicon-item"
          :class="{ due: isDue(item) }"
        >
          <span class="word">{{ item.sourceWord }}</span>
          <span class="translation">{{ item.targetWord }}</span>
          <span class="meta">{{ item.status }} · next: {{ formatNextReview(item) }}</span>
        </div>
      </div>
      <div class="lexicon-empty" v-else>
        <p>No words yet. Talk to NPCs and complete quests to learn vocabulary!</p>
      </div>
    </rpg-window>
    <div class="back-btn" @click="close">✕ Close</div>
  </div>
</template>

<script>
export default {
  name: 'rpg-lexicon',
  inject: ['rpgKeypress', 'rpgGuiClose', 'rpgEngine', 'rpgGui'],
  props: {
    vocabulary: {
      type: Array,
      default: () => [],
    },
    dueCount: {
      type: Number,
      default: 0,
    },
  },
  mounted() {
    if (this.rpgGui.exists('rpg-controls')) this.rpgGui.hide('rpg-controls');
    this.rpgEngine.controls.stopInputs();
    this.obsKeyPress = this.rpgKeypress.subscribe(({ control }) => {
      if (control && control.actionName === 'back') {
        this.close();
      }
    });
  },
  unmounted() {
    if (this.obsKeyPress) this.obsKeyPress.unsubscribe();
  },
  methods: {
    isDue(item) {
      if (item.status === 'new' || item.status === 'learning') return true;
      if (!item.lastReviewedAt || !item.interval) return true;
      const next = new Date(item.lastReviewedAt).getTime() + item.interval * 24 * 60 * 60 * 1000;
      return Date.now() >= next;
    },
    formatNextReview(item) {
      if (item.status === 'new') return 'now';
      if (!item.lastReviewedAt || item.interval == null) return '—';
      const next = new Date(item.lastReviewedAt).getTime() + item.interval * 24 * 60 * 60 * 1000;
      const d = new Date(next);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    },
    close() {
      this.rpgGuiClose('rpg-lexicon');
      this.rpgEngine.controls.listenInputs();
      if (this.rpgGui.exists('rpg-controls')) this.rpgGui.display('rpg-controls');
    },
  },
};
</script>

<style scoped>
.lexicon-panel {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}
.lexicon-window {
  max-width: 560px;
  max-height: 80%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.lexicon-header {
  margin-bottom: 12px;
}
.lexicon-header h2 {
  margin: 0 0 4px 0;
  font-size: 1.25rem;
}
.subtitle {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.9;
}
.lexicon-list {
  overflow-y: auto;
  flex: 1;
}
.lexicon-item {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  align-items: center;
}
.lexicon-item.due {
  background: rgba(76, 175, 80, 0.15);
}
.lexicon-item .word {
  font-weight: 600;
}
.lexicon-item .translation {
  color: rgba(255, 255, 255, 0.9);
}
.lexicon-item .meta {
  font-size: 0.75rem;
  opacity: 0.7;
}
.lexicon-empty {
  padding: 24px;
  text-align: center;
  opacity: 0.9;
}
.back-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 8px 14px;
  cursor: pointer;
  background: rgba(128, 130, 162, 0.8);
  border-radius: 6px;
  font-size: 0.9rem;
}
.back-btn:hover {
  background: rgba(128, 130, 162, 1);
}
</style>
