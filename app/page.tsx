"use client"

import { useEffect, useState } from "react"
import { Sun, Cloud, CloudRain, Snowflake, Moon, Check, X, Plus } from "lucide-react"

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
  const iconProps = "w-24 h-24 sm:w-32 sm:h-32 text-slate-700 dark:text-gray-200 transition-transform duration-1000 transform animate-fade-in"
  
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
      return <Sun className={iconProps} />;
  }
}

export default function Home() {
  const [dateTime, setDateTime] = useState(getFormattedDateTime())
  const [weather, setWeather] = useState(null)
  const [isDark, setIsDark] = useState(true)
  const [events, setEvents] = useState([
    "Riunione con il team alle 10:00",
    "Pranzo con Anna",
  ])
  const [todos, setTodos] = useState([
    { text: "Completare il report", completed: false },
    { text: "Preparare la presentazione", completed: true },
  ])
  const [newTodo, setNewTodo] = useState("")
  const [isDaytime, setIsDaytime] = useState(true);

  // Tema chiaro/scuro
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

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
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500 font-sans p-4 sm:p-8">
      <div className="container mx-auto max-w-6xl">
        
        {/* Intestazione e pulsante tema */}
        <header className="flex justify-between items-center mb-12 sm:mb-16">
          <div>
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Planning</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-300"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        {/* Griglia della dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Scheda Meteo e Ora */}
          <div className="col-span-1 lg:col-span-2 p-6 sm:p-8 rounded-2xl shadow-xl bg-white dark:bg-gray-800 flex flex-col md:flex-row items-center justify-between animate-fade-in-up">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <p className="text-2xl sm:text-3xl font-light">{dateTime.time}</p>
              <h2 className="text-lg sm:text-xl font-medium mt-2">{dateTime.date}</h2>
            </div>
            {weather ? (
              <div className="flex flex-col items-center">
                <WeatherIcon condition={weather.weather[0].main} isDaytime={isDaytime} />
                <p className="text-4xl sm:text-5xl font-light mt-4">{Math.round(weather.main.temp)}°C</p>
                <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mt-2">{weather.name}</p>
                <p className="text-sm sm:text-base capitalize text-gray-500 dark:text-gray-400">{weather.weather[0].description}</p>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">Caricamento meteo...</div>
            )}
          </div>
          
          {/* Scheda To-Do List */}
          <div className="col-span-1 p-6 sm:p-8 rounded-2xl shadow-xl bg-white dark:bg-gray-800 flex flex-col animate-fade-in-up-delay-100">
            <h2 className="text-xl sm:text-2xl font-light mb-4">To-Do List</h2>
            <div className="space-y-3 flex-grow">
              {todos.map((todo, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(index)}
                    className="form-checkbox h-5 w-5 rounded text-gray-900 dark:text-gray-100 transition duration-150 ease-in-out"
                  />
                  <span className={`flex-grow text-base ${todo.completed ? "line-through text-gray-500 dark:text-gray-400" : ""}`}>
                    {todo.text}
                  </span>
                  <button onClick={() => deleteTodo(index)} aria-label="Elimina">
                    <X className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTodo()
                }}
                placeholder="Aggiungi una nuova attività"
                className="w-full p-3 rounded-xl bg-gray-200 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all text-sm"
              />
              <button
                onClick={addTodo}
                className="p-3 bg-slate-500 text-white rounded-xl shadow-md hover:bg-slate-600 transition-colors"
                aria-label="Aggiungi attività"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scheda Eventi Calendario */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1 p-6 sm:p-8 rounded-2xl shadow-xl bg-white dark:bg-gray-800 flex flex-col animate-fade-in-up-delay-200">
            <h2 className="text-xl sm:text-2xl font-light mb-4">Eventi Calendario</h2>
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                  <p className="flex-grow text-base">{event}</p>
                </div>
              ))}
            </div>
            <textarea
              className="mt-6 w-full p-4 h-32 rounded-xl bg-gray-200 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all resize-none text-sm"
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
