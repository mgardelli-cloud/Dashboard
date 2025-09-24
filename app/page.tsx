"use client"

import { useEffect, useState } from "react"
import { Sun, Cloud, CloudRain, Snowflake, Moon, Check, X, Plus, Menu } from "lucide-react"

// Funzione per formattare la data e l'ora
const getFormattedDateTime = () => {
  const now = new Date()
  const date = now.toLocaleDateString("it-IT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const time = now.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  })
  return { date, time }
}

const WeatherIcon = ({ condition, isDaytime }) => {
  const iconProps = "w-24 h-24 sm:w-32 sm:h-32 text-gray-900 dark:text-gray-200 transition-transform duration-1000 transform animate-fade-in"
  
  switch (condition) {
    case "Clear":
      return isDaytime ? <Sun className={iconProps} /> : <Moon className={iconProps} />;
    case "Clouds":
      return <Cloud className={iconProps} />;
    case "Rain":
    case "Drizzle":
      return <CloudRain className={iconProps} />;
    case "Snow":
      return <Snowflake className={iconProps} />;
    default:
      return isDaytime ? <Sun className={iconProps} /> : <Moon className={iconProps} />;
  }
}

export default function App() {
  const [dateTime, setDateTime] = useState(getFormattedDateTime())
  const [weather, setWeather] = useState(null)
  const [isDark, setIsDark] = useState(true);
  const [events, setEvents] = useState([])
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState("")
  const [isDaytime, setIsDaytime] = useState(true);

  // Tema chiaro/scuro
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Aggiorna data e ora ogni secondo
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(getFormattedDateTime())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Chiamata API per il meteo
  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      // Sostituisci "YOUR_API_KEY_HERE" con la tua chiave API di OpenWeatherMap
      const apiKey = "cf811c20e0ff9d0881742fc8988d41a0"
      if (apiKey === "YOUR_API_KEY_HERE") {
        console.error("Errore: Inserisci la tua chiave API di OpenWeatherMap per visualizzare il meteo.");
        return;
      }
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=it`,
        )
        const data = await response.json()
        setWeather(data)
        
        const now = new Date();
        const sunrise = new Date(data.sys.sunrise * 1000);
        const sunset = new Date(data.sys.sunset * 1000);
        setIsDaytime(now > sunrise && now < sunset);
      } catch (error) {
        console.error("Errore nel recupero del meteo:", error)
      }
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude)
      }, () => {
        // Fallback per Roma, Italia
        fetchWeather(41.9028, 12.4964);
      })
    } else {
      // Fallback per Roma, Italia
      fetchWeather(41.9028, 12.4964);
    }
  }, [])

  // Gestione della to-do list
  const addTodo = () => {
    if (newTodo.trim() !== "") {
      setTodos([...todos, { text: newTodo, completed: false }])
      setNewTodo("")
    }
  }

  const toggleTodo = (index) => {
    const newTodos = [...todos]
    newTodos[index].completed = !newTodos[index].completed
    setTodos(newTodos)
  }

  const deleteTodo = (index) => {
    const newTodos = todos.filter((_, i) => i !== index)
    setTodos(newTodos)
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-white font-sans p-4 sm:p-8">
      <div className="container mx-auto max-w-6xl">
        
        {/* Intestazione con stile minimale */}
        <header className="flex justify-between items-center mb-16 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-4">
            <Menu className="w-6 h-6 text-gray-500 dark:text-gray-400 cursor-pointer" />
            <h1 className="text-2xl font-light tracking-wide">DASHBOARD</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 focus:outline-none"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </header>

        {/* Griglia della dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Scheda Meteo e Ora */}
          <div className="lg:col-span-3 p-8 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between animate-fade-in-up">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <p className="text-8xl font-light">{dateTime.time}</p>
              <h2 className="text-xl font-medium mt-2 text-gray-500 dark:text-gray-400">{dateTime.date}</h2>
            </div>
            {weather ? (
              <div className="flex flex-col items-center">
                <WeatherIcon condition={weather.weather[0].main} isDaytime={isDaytime} />
                <p className="text-6xl font-light mt-4 text-gray-900 dark:text-white">{Math.round(weather.main.temp)}°C</p>
                <p className="text-xl text-gray-500 dark:text-gray-400 mt-2">{weather.name}</p>
                <p className="text-base capitalize text-gray-500 dark:text-gray-500">{weather.weather[0].description}</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">Caricamento meteo...</div>
            )}
          </div>
          
          {/* Scheda To-Do List */}
          <div className="col-span-1 md:col-span-1 p-8 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col animate-fade-in-up-delay-100">
            <h2 className="text-xl sm:text-2xl font-light mb-4 text-gray-900 dark:text-gray-200">To-Do List</h2>
            <div className="space-y-4 flex-grow">
              {todos.map((todo, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(index)}
                    className="form-checkbox h-5 w-5 bg-gray-300 dark:bg-gray-800 border-gray-400 dark:border-gray-700 checked:bg-gray-600 dark:checked:bg-gray-400 rounded-sm cursor-pointer transition-colors duration-200"
                  />
                  <span className={`flex-grow text-base ${todo.completed ? "line-through text-gray-500" : ""}`}>
                    {todo.text}
                  </span>
                  <button onClick={() => deleteTodo(index)} aria-label="Elimina">
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-red-500 transition-colors" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTodo()
                }}
                placeholder="Aggiungi una nuova attività"
                className="w-full p-3 rounded-lg bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-sm placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-gray-500 dark:focus:border-gray-500 transition-all"
              />
              <button
                onClick={addTodo}
                className="p-3 bg-gray-300 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors"
                aria-label="Aggiungi attività"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scheda Eventi Calendario */}
          <div className="col-span-1 md:col-span-1 p-8 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col animate-fade-in-up-delay-200">
            <h2 className="text-xl sm:text-2xl font-light mb-4 text-gray-900 dark:text-gray-200">Eventi Calendario</h2>
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400"></div>
                  <p className="flex-grow text-base">{event}</p>
                </div>
              ))}
            </div>
            <textarea
              className="mt-8 w-full p-4 h-32 rounded-lg bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-gray-500 dark:focus:border-gray-500 transition-all resize-none text-sm"
              placeholder="Scrivi qui i tuoi eventi..."
              value={events.join('\n')}
              onChange={(e) => setEvents(e.target.value.split('\n'))}
            ></textarea>
          </div>

        </div>
      </div>
    </div>
  )
}
