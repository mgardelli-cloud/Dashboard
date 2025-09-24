"use client"

import { useEffect, useState } from "react"
import { Sun, Cloud, CloudRain, Snowflake, Moon, Check, X, Plus, Menu, Leaf, ChevronLeft, ChevronRight, CalendarDays, Calendar } from "lucide-react"

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

const AirPollutionIcon = ({ aqi }) => {
  const iconProps = "w-24 h-24 sm:w-32 sm:h-32 text-gray-900 dark:text-gray-200 transition-transform duration-1000 transform animate-fade-in"
  switch (aqi) {
    case 1:
      return <Leaf className={iconProps + " text-green-500"} />;
    case 2:
      return <Leaf className={iconProps + " text-yellow-500"} />;
    case 3:
      return <Leaf className={iconProps + " text-yellow-500"} />;
    case 4:
      return <Leaf className={iconProps + " text-red-500"} />;
    case 5:
      return <Leaf className={iconProps + " text-red-500"} />;
    default:
      return <Leaf className={iconProps} />;
  }
};

const getAirPollutionDescription = (aqi) => {
  switch (aqi) {
    case 1:
      return "Buona";
    case 2:
      return "Discreta";
    case 3:
      return "Moderata";
    case 4:
      return "Scadente";
    case 5:
      return "Pessima";
    default:
      return "Sconosciuta";
  }
};

const generateDummyEvents = () => [];

export default function App() {
  const [dateTime, setDateTime] = useState(getFormattedDateTime())
  const [weather, setWeather] = useState(null)
  const [airPollution, setAirPollution] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState("")
  const [isDaytime, setIsDaytime] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});

  const daysOfWeek = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  const hoursOfDay = Array.from({ length: 14 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);


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

  // Chiamata API per il meteo e l'inquinamento atmosferico
  useEffect(() => {
    const apiKey = "c7631818267be06f45e432d6497d29c1"
    if (apiKey === "YOUR_API_KEY_HERE") {
        console.error("Errore: Inserisci la tua chiave API di OpenWeatherMap per visualizzare il meteo e l'inquinamento atmosferico.");
        return;
    }

    const fetchWeatherAndAirPollution = async (lat, lon) => {
      try {
        // Fetch meteo
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=it`,
        )
        const weatherData = await weatherResponse.json()
        setWeather(weatherData)
        
        const now = new Date();
        const sunrise = new Date(weatherData.sys.sunrise * 1000);
        const sunset = new Date(weatherData.sys.sunset * 1000);
        setIsDaytime(now > sunrise && now < sunset);

        // Fetch inquinamento atmosferico
        const airPollutionResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`,
        );
        const airPollutionData = await airPollutionResponse.json();
        setAirPollution(airPollutionData);

      } catch (error) {
        console.error("Errore nel recupero dei dati:", error)
      }
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        fetchWeatherAndAirPollution(position.coords.latitude, position.coords.longitude)
      }, () => {
        // Fallback per Roma, Italia
        fetchWeatherAndAirPollution(41.9028, 12.4964);
      })
    } else {
      // Fallback per Roma, Italia
      fetchWeatherAndAirPollution(41.9028, 12.4964);
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

  // Logica calendario
  const today = new Date();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
  const numDaysInMonth = lastDayOfMonth.getDate();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const handleEventChange = (e, hour) => {
    const dateKey = selectedDate.toDateString();
    setEvents(prevEvents => {
      const newEvents = { ...prevEvents };
      if (!newEvents[dateKey]) {
        newEvents[dateKey] = {};
      }
      newEvents[dateKey][hour] = e.target.value;
      return newEvents;
    });
  };

  const days = [];
  for (let i = 0; i < startDayIndex; i++) {
    days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
  }
  for (let i = 1; i <= numDaysInMonth; i++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
    const isToday = date.toDateString() === today.toDateString();
    const isSelected = selectedDate.toDateString() === date.toDateString();
    days.push(
      <div 
        key={i} 
        className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-200
          ${isToday ? "bg-gray-800 dark:bg-gray-300 text-white dark:text-gray-900" : ""}
          ${!isToday && isSelected ? "bg-gray-200 dark:bg-gray-700" : ""}
          ${!isToday && !isSelected ? "hover:bg-gray-200 dark:hover:bg-gray-700" : ""}`}
        onClick={() => setSelectedDate(date)}
      >
        {i}
      </div>
    );
  }

  const eventsForSelectedDay = events[selectedDate.toDateString()] || {};
  const selectedDayHeader = selectedDate.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white font-sans p-4 sm:p-8">
      <div className="container mx-auto max-w-6xl">
        
        {/* Intestazione con stile minimale */}
        <header className="flex justify-between items-center mb-16 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-4">
            <Menu className="w-6 h-6 text-gray-900 dark:text-gray-400 cursor-pointer" />
            <h1 className="text-2xl font-light tracking-wide text-gray-900 dark:text-white">DASHBOARD</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-900 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 focus:outline-none"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </header>

        {/* Griglia della dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Scheda Meteo e Ora */}
          <div className="lg:col-span-3 p-8 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 flex flex-col md:flex-row items-center justify-between animate-fade-in-up">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <p className="text-8xl font-light text-gray-900 dark:text-white">{dateTime.time}</p>
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
            {airPollution ? (
              // Contenitore per i dati e la legenda dell'inquinamento atmosferico
              <div className="flex items-center mt-6 md:mt-0 md:ml-6">
                {/* Blocco qualità dell'aria */}
                <div className="flex flex-col items-center">
                  <AirPollutionIcon aqi={airPollution.list[0].main.aqi} />
                  <p className="text-6xl font-light mt-4 text-gray-900 dark:text-white">{airPollution.list[0].main.aqi}</p>
                  <p className="text-xl text-gray-500 dark:text-gray-400 mt-2">Qualità dell'aria</p>
                  <p className="text-base capitalize text-gray-500 dark:text-gray-500">{getAirPollutionDescription(airPollution.list[0].main.aqi)}</p>
                </div>
                
                {/* Legenda AQI */}
                <div className="flex flex-col justify-center ml-6 h-full">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">AQI</p>
                  <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <span>1 (Best)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                      <span>2-3 (OK)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span>4-5 (Poor)</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">Caricamento qualità dell'aria...</div>
            )}
          </div>
          
          {/* Scheda To-Do List */}
          <div className="col-span-1 md:col-span-1 p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 flex flex-col animate-fade-in-up-delay-100">
            <h2 className="text-xl sm:text-2xl font-light mb-4 text-gray-900 dark:text-gray-200">To-Do List</h2>
            <div className="space-y-2">
              {todos.length > 0 ? (
                todos.map((todo, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(index)}
                      className="form-checkbox h-5 w-5 bg-gray-300 dark:bg-gray-800 border-gray-400 dark:border-gray-700 checked:bg-gray-600 dark:checked:bg-gray-400 rounded-sm cursor-pointer transition-colors duration-200"
                    />
                    <span className={`flex-grow text-base text-gray-900 dark:text-white ${todo.completed ? "line-through text-gray-500" : ""}`}>
                      {todo.text}
                    </span>
                    <button onClick={() => deleteTodo(index)} aria-label="Elimina">
                      <X className="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 dark:text-gray-400 text-sm">Nessuna attività aggiunta.</div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTodo()
                }}
                placeholder="Aggiungi una nuova attività"
                className="w-full p-2 rounded-lg bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-sm placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-gray-500 dark:focus:border-gray-500 transition-all text-gray-900 dark:text-white"
              />
              <button
                onClick={addTodo}
                className="p-2 bg-gray-300 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors"
                aria-label="Aggiungi attività"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scheda Eventi Calendario */}
          <div className="col-span-1 md:col-span-1 p-8 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 flex flex-col animate-fade-in-up-delay-200">
            <h2 className="text-xl sm:text-2xl font-light mb-4 text-gray-900 dark:text-gray-200">Eventi Calendario</h2>
            
            {/* Navigazione e controlli del calendario */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-gray-400" />
              </button>
              <h3 className="text-lg font-medium">
                {currentMonth.toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
              </h3>
              <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-900 dark:text-gray-400" />
              </button>
              <div className="flex gap-2 ml-4">
                <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <CalendarDays className="w-5 h-5 text-gray-900 dark:text-gray-400" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Calendar className="w-5 h-5 text-gray-900 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Griglia del calendario */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400">
              {daysOfWeek.map(day => <span key={day}>{day}</span>)}
              {days}
            </div>

            {/* Dettagli del giorno selezionato */}
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">{selectedDayHeader}</h4>
              <div className="space-y-4">
                {hoursOfDay.map(hour => (
                  <div key={hour} className="flex items-start gap-4 text-sm">
                    <span className="w-12 text-gray-500 dark:text-gray-400">{hour}</span>
                    <input
                      type="text"
                      value={eventsForSelectedDay[hour] || ""}
                      onChange={(e) => handleEventChange(e, hour)}
                      className="flex-grow p-2 rounded-lg bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-sm placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-gray-500 dark:focus:border-gray-500 transition-all text-gray-900 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
