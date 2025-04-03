// src/App.js
import { PokemonTeamViewModel } from "../viewModel.js";
import PokemonCard from "./PokemonCard.js";

export const App = {
  components: {
    "pokemon-card": PokemonCard,
  },
  template: /*html*/ `
    <div>
      <!-- (1) Pantalla de CONFIGURACIÓN -->
      <section v-if="currentScreen === 'setup'" class="setup-container">
        <h2 class="setup-title">Configuració dels Jugadors</h2>
        <p class="setup-instruccions">
          Introdueix els noms dels jugadors per començar el joc.
        </p>
  
        <div class="toggle-container">
          <label for="two-players-toggle">Dos Jugadors:</label>
          <label class="switch">
            <input type="checkbox" v-model="isTwoPlayers" id="two-players-toggle"/>
            <span class="slider round"></span>
          </label>
        </div>
  
        <div class="player-input-group">
          <label for="player1-name" class="player-label">Nom del Jugador 1:</label>
          <input type="text" v-model="player1Name" class="player-input" required />
        </div>
  
        <div class="player-input-group" v-if="isTwoPlayers">
          <label for="player2-name" class="player-label">Nom del Jugador 2:</label>
          <input type="text" v-model="player2Name" class="player-input" required />
        </div>
  
        <button @click="startGame" class="setup-button">Següent</button>
      </section>

      <!-- (2) Pantalla de SELECCIÓN DE EQUIP -->
      <section v-if="currentScreen === 'teamSelection'" id="team-selection-section">
        <h2>Selecciona el teu Equip</h2>
        <h2>{{ currentPlayerSelectionMessage }}</h2>
        <h2 id="credits-display">
          Crèdits restants: <span id="credits-value">{{ creditsDisplay }}</span>
        </h2>

        <!-- Equipo actual -->
        <div id="team-section">
          <h2 id="current-player-selection">{{ currentPlayerSelectionDisplay }}</h2>
          <div id="selected-team-grid" class="grid-container">
            <pokemon-card
              v-for="(poke, index) in currentPlayerTeam"
              :key="index"
              :pokemon="poke"
              :is-selected="isPokemonInTeam(poke.name)"
              @toggle-selection="handleToggleSelection"
            />
          </div>
        </div>

        <!-- Botón para cambiar de jugador o finalizar -->
        <button id="next-player-button" @click="handleNextPlayer">
          {{ buttonLabel }}
        </button>

        <!-- Opciones de ordenación -->
        <div id="sort-options-section">
          <h2>Opcions d'Ordenació</h2>
          <form id="sort-options-form">
            <fieldset>
              <legend>Ordena per:</legend>
              <label>
                <input type="radio" name="sort-criteria" value="name" v-model="sortCriteria" />
                Nom
              </label>
              <label>
                <input type="radio" name="sort-criteria" value="points" v-model="sortCriteria" />
                Punts
              </label>
              <label>
                <input type="radio" name="sort-criteria" value="type" v-model="sortCriteria" />
                Tipus
              </label>
            </fieldset>
            <fieldset>
              <legend>Mètode d'ordenació:</legend>
              <label>
                <input type="radio" name="sort-method" value="bubble" v-model="sortMethod" />
                Bombolla
              </label>
              <label>
                <input type="radio" name="sort-method" value="insertion" v-model="sortMethod" />
                Inserció
              </label>
              <label>
                <input type="radio" name="sort-method" value="selection" v-model="sortMethod" />
                Selecció
              </label>
            </fieldset>
            <button type="button" id="sort-team" @click="handleSortOptions">
              Ordenar
            </button>
          </form>
        </div>

        <!-- Lista global de Pokémon -->
        <div id="pokemon-grid" class="grid-container">
          <pokemon-card
            v-for="(poke, index) in globalPokemonList"
            :key="index"
            :pokemon="poke"
            :is-selected="isPokemonInTeam(poke.name)"
            @toggle-selection="handleToggleSelection"
          />
        </div>
      </section>

      <!-- (3) Pantalla INTERMEDIA DE BATALLA -->
      <section v-if="currentScreen === 'battleSection'">
        <h2>Moment de la Batalla!</h2>
        <p>Comença la batalla!</p>
        <!-- Al pulsar este botón se pasa a la pantalla final y se inicia la batalla automática -->
        <button @click="goToBattle">Atacar!</button>
      </section>

      <!-- (4) Pantalla FINAL: Vista general + Arena de combate -->
      <section v-if="currentScreen === 'battle'" id="battle-screen">
        <!-- Vista General dels Equips -->
        <section id="teams-overview-section">
          <h2>Vista General dels Equips</h2>
          <h3 id="player1-team-name">Equip del Jugador 1: {{ player1Name }}</h3>
          <div id="player1-team-display" class="player1-selected-team-grid">
            <pokemon-card
              v-for="(poke, index) in player1Team"
              :key="'p1-' + index"
              :pokemon="poke"
              :is-selected="true"
            />
          </div>
          <h3 id="player2-team-name">Equip del Jugador 2: {{ player2Name }}</h3>
          <div id="player2-team-display" class="player2-selected-team-grid">
            <pokemon-card
              v-for="(poke, index) in player2Team"
              :key="'p2-' + index"
              :pokemon="poke"
              :is-selected="true"
            />
          </div>
        </section>

        <!-- Arena de Batalla -->
        <section id="battle-arena-section">
          <div class="battle-container">
            <!-- Luchador 1 -->
            <div id="pokemon1-display" class="pokemon-fighter">
              <div v-if="currentBattle.pokemon1">
                <img :src="currentBattle.pokemon1.image" :alt="currentBattle.pokemon1.name" />
                <h3>{{ currentBattle.pokemon1.name }}</h3>
                <p>Especial: {{ currentBattle.pokemon1.special_power }}</p>
              </div>
            </div>
  
            <p class="vs-text">VS</p>
  
            <!-- Luchador 2 -->
            <div id="pokemon2-display" class="pokemon-fighter">
              <div v-if="currentBattle.pokemon2">
                <img :src="currentBattle.pokemon2.image" :alt="currentBattle.pokemon2.name" />
                <h3>{{ currentBattle.pokemon2.name }}</h3>
                <p>Especial: {{ currentBattle.pokemon2.special_power }}</p>
              </div>
            </div>
  
            <!-- Registro de la batalla -->
            <div class="battle-log-container">
              <h2>Registre de la Batalla</h2>
              <div id="battle-log">
                <p v-for="(log, index) in battleLog" :key="index">{{ log }}</p>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  `,

  data() {
    return {
      // Control de pantallas: 'setup' -> 'teamSelection' -> 'battleSection' -> 'battle'
      currentScreen: "setup",
      isTwoPlayers: true,
      player1Name: "",
      player2Name: "",
      buttonLabel: "Següent Jugador",

      // Ordenación
      sortCriteria: "name",
      sortMethod: "bubble",

      // Datos Pokémon
      globalPokemonList: [],

      // Estado de batalla
      currentBattle: {},
      battleLog: [],
      currentTurnMessage: "",

      // Instancia del viewModel (lógica de negocio)
      viewModel: new PokemonTeamViewModel(),
    };
  },

  computed: {
    creditsDisplay() {
      return this.viewModel.getCredits();
    },
    currentPlayerTeam() {
      return this.viewModel.getCurrentTeam();
    },
    player1Team() {
      return this.viewModel.player1.team.selectedTeam;
    },
    player2Team() {
      return this.viewModel.player2.team.selectedTeam;
    },
    currentPlayerSelectionMessage() {
      return this.viewModel.currentPlayer.name + ", selecciona el teu Pokémon";
    },
    currentPlayerSelectionDisplay() {
      return this.viewModel.currentPlayer.name;
    },
  },

  methods: {
    // (A) Inicia el juego: de 'setup' a 'teamSelection'
    async startGame() {
      if (!this.player1Name || (this.isTwoPlayers && !this.player2Name)) {
        alert("Si us plau, introdueix els noms de tots els jugadors.");
        return;
      }
      if (!this.isTwoPlayers) {
        this.player2Name = "CPU";
      }
      this.viewModel.initializeMatch(this.player1Name, this.player2Name);
      this.currentScreen = "teamSelection";
      await this.fetchAndLoadPokemons();
    },

    // (B) Carga Pokémon desde el JSON
    async fetchAndLoadPokemons() {
      try {
        const response = await fetch("./pokemon_data.json");
        if (!response.ok) {
          throw new Error("HTTP error: " + response.status);
        }
        const data = await response.json();
        this.viewModel.pokemonList.loadPokemons(data);
        this.globalPokemonList = this.viewModel.getGlobalList();
      } catch (error) {
        console.error("Error loading Pokémon data:", error);
      }
    },

    // (C) Añadir/Quitar Pokémon del equipo
    handleToggleSelection(pokemon) {
      const isInTeam = this.isPokemonInTeam(pokemon.name);
      if (isInTeam) {
        this.viewModel.removePokemonFromTeam(pokemon.name);
      } else {
        const addResult = this.viewModel.addPokemonToCurrentPlayer(pokemon);
        if (!addResult) {
          alert("No es pot afegir el Pokémon.");
        }
      }
      // Refrescar la lista global
      this.globalPokemonList = [...this.viewModel.getGlobalList()];
    },

    // (D) Botón "Següent Jugador" o "Fi de la selecció d'equips"
    handleNextPlayer() {
      if (this.viewModel.currentPlayer === this.viewModel.player1) {
        // Cambiar de jugador
        this.viewModel.switchPlayer();
        if (this.isTwoPlayers) {
          this.buttonLabel = "Fi de la selecció d'equips";
        } else {
          // Modo CPU
          this.viewModel.autoSelectCpuTeam();
          this.buttonLabel = "Fi de la selecció d'equips";
        }
      } else {
        // Ambos jugadores han terminado la selección; ir a 'battleSection'
        this.currentScreen = "battleSection";
      }
    },

    // (E) Ordenar la lista global
    handleSortOptions() {
      this.viewModel.sortGlobalList(this.sortCriteria, this.sortMethod);
      this.globalPokemonList = [...this.viewModel.getGlobalList()];
    },

    // (F) Verificar si un Pokémon está en el equipo actual
    isPokemonInTeam(name) {
      const team =
        this.viewModel.currentPlayer === this.viewModel.player1
          ? this.viewModel.player1.team.selectedTeam
          : this.viewModel.player2.team.selectedTeam;
      return team.some((p) => p.name === name);
    },

    // (G) Al pulsar "Atacar!" en 'battleSection': muestra la pantalla final y comienza la batalla automática
    goToBattle() {
      this.currentScreen = "battle";
      this.currentTurnMessage = "És el torn del Jugador 1!";
      this.startBattle();
    },

    // (H) Ejecuta la batalla automáticamente (varias rondas) hasta que un equipo se quede sin Pokémon
    async startBattle() {
      while (
        this.viewModel.player1.team.selectedTeam.length > 0 &&
        this.viewModel.player2.team.selectedTeam.length > 0
      ) {
        const result = await this.viewModel.fightRound();
        if (result) {
          // Asignar los Pokémon que pelean en esta ronda a currentBattle
          if (result.roundData) {
            this.currentBattle = result.roundData;
          }
          // Agregar mensajes al registro de batalla
          if (result.initialMessage) {
            this.battleLog.push(result.initialMessage);
          }
          if (result.resultMessage) {
            this.battleLog.push(result.resultMessage);
          }
        }
        // Verificar si la batalla ha finalizado
        if (
          this.viewModel.player1.team.selectedTeam.length === 0 ||
          this.viewModel.player2.team.selectedTeam.length === 0
        ) {
          this.currentTurnMessage = "La batalla ha acabat!";
          break;
        } else {
          this.currentTurnMessage = "Continuant la batalla...";
        }
        // Espera 2 segundos entre rondas para visualizar el cambio
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    },
  },
};
