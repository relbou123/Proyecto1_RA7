// viewModel.js
import { Player, PokemonList, PokemonTeam } from "./model.js";

export class PokemonTeamViewModel {
  constructor() {
    this.player1 = new Player();
    this.player2 = new Player();
    this.currentPlayer = this.player1;
    // Atributos obligatorios según UML
    this.team = new PokemonTeam();
    this.pokemonList = new PokemonList();
    // Se ha eliminado la referencia a view.js (pokemonUI)
  }

  // Inicializa el match con dos jugadores
  initializeMatch(player1Name, player2Name) {
    this.player1 = new Player(player1Name);
    this.player2 = new Player(player2Name);
    this.currentPlayer = this.player1;
  }

  // Cambia al siguiente jugador
  switchPlayer() {
    // Se corrige: usamos "===" para comparar, no "="
    if (this.currentPlayer.name === this.player1.name) {
      this.currentPlayer = this.player2;
    } else {
      this.currentPlayer = this.player1;
    }
  }

  // Devuelve el jugador actual
  getCurrentPlayer() {
    return this.currentPlayer;
  }

  // Comprueba si ambos equipos están completos
  areTeamsComplete() {
    return this.player1.team.isFull() && this.player2.team.isFull();
  }

  // Añade un Pokémon al equipo (por nombre, si fuese necesario)
  addPokemonToTeam(name) {
    const pokemon = this.pokemonList.getPokemonByName(name);
    if (!pokemon) {
      console.error("❌ Pokémon not found in the global list.");
      return;
    }

    if (this.team.getCredits() < pokemon.points) {
      console.error("❌ Not enough credits to add this Pokémon!");
      return;
    }

    const success = this.team.addPokemon(pokemon);
    if (!success) {
      console.warn(`⚠️ The Pokémon ${pokemon.name} is already on the team.`);
    }
  }

  // Añade un Pokémon al equipo del jugador actual
  addPokemonToCurrentPlayer(pokemon) {
    if (this.currentPlayer === this.player1) {
      return this.player1.team.addPokemon(pokemon);
    } else if (this.currentPlayer === this.player2) {
      return this.player2.team.addPokemon(pokemon);
    }
  }

  // Elimina un Pokémon del equipo del jugador actual
  removePokemonFromTeam(pokemon) {
    if (this.currentPlayer === this.player1) {
      this.player1.team.removePokemon(pokemon);
    } else if (this.currentPlayer === this.player2) {
      return this.player2.team.removePokemon(pokemon);
    }
  }

  // Ordena la lista global de Pokémon
  sortGlobalList(criteria, method) {
    this.pokemonList.sortPokemons(criteria, method);
  }

  // Devuelve el array de Pokémon (la lista global)
  getGlobalList() {
    return this.pokemonList.allPokemons;
  }

  // Devuelve un string con los detalles del equipo actual
  getTeamDetails() {
    return this.team.getTeamDetails();
  }

  // Devuelve el equipo actual del jugador activo
  getCurrentTeam() {
    if (this.currentPlayer === this.player1) {
      return this.player1.getTeam();
    } else if (this.currentPlayer === this.player2) {
      return this.player2.getTeam();
    }
  }

  // Devuelve los créditos actuales del jugador activo
  getCredits() {
    return this.currentPlayer.team.getCredits();
  }

  // Permite actualizar los nombres de los jugadores
  setPlayerNames(player1Name, player2Name) {
    this.player1.name = player1Name;
    this.player2.name = player2Name;
  }

  // Selección automática de equipo para la CPU
  autoSelectCpuTeam() {
    console.log("⚙️ Auto-selecting Pokémon for CPU...");
    const cpuTeam = this.player2.team;
    const availablePokemons = [...this.pokemonList.allPokemons];

    // Mezcla aleatoria
    for (let i = availablePokemons.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availablePokemons[i], availablePokemons[j]] = [availablePokemons[j], availablePokemons[i]];
    }

    // Añade Pokémon mientras haya créditos y espacio
    for (let pokemon of availablePokemons) {
      if (
        cpuTeam.selectedTeam.length < cpuTeam.maxTeamSize &&
        cpuTeam.credits >= pokemon.points
      ) {
        cpuTeam.addPokemon(pokemon);
      }
      if (cpuTeam.selectedTeam.length >= cpuTeam.maxTeamSize) break;
    }

    console.log(`✅ CPU team selected: ${cpuTeam.getTeamDetails()}`);
  }

  // Ejecuta una ronda de batalla; devuelve un objeto con mensajes y los combatientes
  fightRound() {
    return new Promise((resolve) => {
      const pokemon1 = this.getRandomFighter(this.player1.team);
      const pokemon2 = this.getRandomFighter(this.player2.team);
      if (!pokemon1 || !pokemon2) {
        return resolve({ resultMessage: "No hi ha suficients combatents." });
      }

      // Mensaje inicial de la ronda
      const initialMessage = `⚔️ ${pokemon1.name} vs ${pokemon2.name}`;

      // Simula una espera de 5 segundos para la ronda
      setTimeout(() => {
        let resultMessage = "";
        if (pokemon1.special_power === pokemon2.special_power) {
          resultMessage = `💥 ${pokemon1.name} i ${pokemon2.name} es derroten mútuament!`;
          this.player1.team.removePokemon(pokemon1.name);
          this.player2.team.removePokemon(pokemon2.name);
        } else if (pokemon1.special_power > pokemon2.special_power) {
          resultMessage = `💥 ${pokemon1.name} derrota ${pokemon2.name}!`;
          let damageMade = this.player2.team.removePokemon(pokemon2.name);
          let message = this.player1.team.decreaseSpecialPower(pokemon1.name, damageMade);
          resultMessage += ` ${message}`;
        } else {
          resultMessage = `💥 ${pokemon2.name} derrota ${pokemon1.name}!`;
          let damageMade = this.player1.team.removePokemon(pokemon1.name);
          let message = this.player2.team.decreaseSpecialPower(pokemon2.name, damageMade);
          resultMessage += ` ${message}`;
        }

        // Se retorna además la información de los Pokémon que han peleado en esta ronda
        resolve({
          initialMessage,
          resultMessage,
          roundData: {
            pokemon1,
            pokemon2,
          },
        });
      }, 5000);
    });
  }

  // Devuelve un luchador aleatorio del equipo (si hay alguno)
  getRandomFighter(team) {
    if (team.selectedTeam.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * team.selectedTeam.length);
    return team.selectedTeam[randomIndex];
  }
}
