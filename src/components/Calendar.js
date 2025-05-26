import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfDay,
  isBefore,
  isAfter,
  addWeeks,
  addMonths as addRecMonth,
  addDays as addRecDay,
  setHours,
  setMinutes,
  addHours,
} from "date-fns";
import { v4 as uuidv4 } from "uuid";
import "./Calendar.css";

function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem("calendar-events");
    return saved ? JSON.parse(saved) : [];
  });
  const [showModal, setShowModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    start: "",
    end: "",
    description: "",
    recurrence: "none",
    recurrenceInterval: 1,
  });

  useEffect(() => {
    localStorage.setItem("calendar-events", JSON.stringify(events));
  }, [events]);

  const renderHeader = () => (
    <div className="calendar-header">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>Prev</button>
      <div className="calendar-month-year">{format(currentMonth, "MMMM yyyy")}</div>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>Next</button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const dateFormat = "EEEEEE";
    let startDate = startOfWeek(currentMonth, { weekStartsOn: 1 });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="calendar-day" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="calendar-grid">{days}</div>;
  };

  const onDateClick = (day) => {
    setSelectedDate(day);
    const startStr = format(day, "yyyy-MM-dd'T'HH:mm");
    const endStr = format(addHours(day, 1), "yyyy-MM-dd'T'HH:mm"); // default 1 hour
    setFormData({
      title: "",
      start: startStr,
      end: endStr,
      description: "",
      recurrence: "none",
      recurrenceInterval: 1,
    });
    setEditingEventId(null);
    setShowModal(true);
  };

  const handleEditClick = (event) => {
    setEditingEventId(event.id);
    setFormData({
      title: event.title,
      start: format(new Date(event.start), "yyyy-MM-dd'T'HH:mm"),
      end: format(new Date(event.end), "yyyy-MM-dd'T'HH:mm"),
      description: event.description,
      recurrence: event.recurrence || "none",
      recurrenceInterval: event.recurrenceInterval || 1,
    });
    setSelectedDate(new Date(event.start));
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents((prev) => prev.filter((event) => event.id !== id));
    }
  };

  const generateRecurrences = (event, startDate, endDate) => {
    const baseDate = new Date(event.start);
    const results = [];

    if (!event.recurrence || event.recurrence === "none") {
      if (
        isSameDay(baseDate, startDate) ||
        (isAfter(baseDate, startDate) && isBefore(baseDate, endDate))
      ) {
        results.push({ ...event });
      }
      return results;
    }

    let recurDate = baseDate;
    const interval = parseInt(event.recurrenceInterval) || 1;
    const durationMs = new Date(event.end) - new Date(event.start);

    while (recurDate <= endDate) {
      if (recurDate >= startDate && recurDate <= endDate) {
        results.push({
          ...event,
          start: recurDate.toISOString(),
          end: new Date(recurDate.getTime() + durationMs).toISOString(),
        });
      }

      recurDate =
        event.recurrence === "daily"
          ? addRecDay(recurDate, interval)
          : event.recurrence === "weekly"
          ? addWeeks(recurDate, interval)
          : addRecMonth(recurDate, interval);
    }

    return results;
  };

  const hasConflict = (newStart, newEnd, ignoreId = null) => {
    return events.some((event) => {
      if (ignoreId && event.id === ignoreId) return false;

      const existingStart = new Date(event.start);
      const existingEnd = new Date(event.end);

      return newStart < existingEnd && newEnd > existingStart;
    });
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cloneDay = day;

        const allEvents = events.flatMap((evt) =>
          generateRecurrences(evt, startDate, endDate)
        );

        const dayEvents = allEvents
          .filter((evt) =>
            isSameDay(startOfDay(new Date(evt.start)), startOfDay(cloneDay))
          )
          .sort((a, b) => new Date(a.start) - new Date(b.start));

        days.push(
          <div
            className={`calendar-date ${
              !isSameMonth(day, monthStart) ? "disabled" : ""
            } ${isSameDay(day, new Date()) ? "today" : ""}`}
            key={day}
            onClick={() => onDateClick(cloneDay)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dropped = JSON.parse(e.dataTransfer.getData("text/plain"));
              const droppedStart = new Date(dropped.start);
              const droppedEnd = new Date(dropped.end);
              const durationMs = droppedEnd - droppedStart;

              const updatedStart = setHours(
                setMinutes(cloneDay, droppedStart.getMinutes()),
                droppedStart.getHours()
              );
              const updatedEnd = new Date(updatedStart.getTime() + durationMs);

              if (hasConflict(updatedStart, updatedEnd, dropped.id)) {
                alert("Cannot move event due to a time conflict with another event.");
                return;
              }

              setEvents((prev) =>
                prev.map((event) =>
                  event.id === dropped.id
                    ? {
                        ...event,
                        start: updatedStart.toISOString(),
                        end: updatedEnd.toISOString(),
                      }
                    : event
                )
              );
            }}
          >
            <div>{formattedDate}</div>
            {dayEvents.map((evt) => (
              <div
                key={evt.id + evt.start}
                className="event-item"
                title={evt.description}
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData("text/plain", JSON.stringify(evt))
                }
              >
                <div className="event-time">
                  <span>{format(new Date(evt.start), "HH:mm")}</span>
                  <span> - </span>
                  <span>{format(new Date(evt.end), "HH:mm")}</span>
                </div>
                <div className="event-title">{evt.title}</div>
                <div className="event-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(evt);
                    }}
                    title="Edit Event"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(evt.id);
                    }}
                    title="Delete Event"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="calendar-grid" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEventId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Event title is required");
      return;
    }

    const startDate = new Date(formData.start);
    const endDate = new Date(formData.end);

    if (endDate <= startDate) {
      alert("End time must be after start time");
      return;
    }

    if (hasConflict(startDate, endDate, editingEventId)) {
      alert("This event overlaps with another existing event.");
      return;
    }

    const baseEvent = {
      id: editingEventId || uuidv4(),
      title: formData.title,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      description: formData.description,
      recurrence: formData.recurrence,
      recurrenceInterval:
        formData.recurrence === "none"
          ? 1
          : parseInt(formData.recurrenceInterval) || 1,
    };

    if (editingEventId) {
      setEvents((prev) =>
        prev.map((evt) => (evt.id === editingEventId ? baseEvent : evt))
      );
    } else {
      setEvents((prev) => [...prev, baseEvent]);
    }

    closeModal();
  };

  return (
    <div>
        <div className="assignment-title">Custom Event Calendar</div>
        <div className="calendar-container">
        {renderHeader()}
        {renderDays()}
        {renderCells()}

        {showModal && (
            <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>{editingEventId ? "Edit Event" : "Add Event"}</h2>
                <form onSubmit={handleFormSubmit} className="event-form">
                <label htmlFor="title">Title *</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                />

                <label htmlFor="start">Start Date & Time *</label>
                <input
                    type="datetime-local"
                    id="start"
                    name="start"
                    value={formData.start}
                    onChange={handleInputChange}
                    required
                />

                <label htmlFor="end">End Date & Time *</label>
                <input
                    type="datetime-local"
                    id="end"
                    name="end"
                    value={formData.end}
                    onChange={handleInputChange}
                    required
                />

                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                />

                <label htmlFor="recurrence">Recurrence</label>
                <select
                    id="recurrence"
                    name="recurrence"
                    value={formData.recurrence}
                    onChange={handleInputChange}
                >
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>

                {formData.recurrence !== "none" && (
                    <>
                    <label htmlFor="recurrenceInterval">Interval</label>
                    <input
                        type="number"
                        id="recurrenceInterval"
                        name="recurrenceInterval"
                        min="1"
                        value={formData.recurrenceInterval}
                        onChange={handleInputChange}
                    />
                    </>
                )}

                <div className="modal-buttons">
                    <button type="submit">{editingEventId ? "Update" : "Add"}</button>
                    <button type="button" onClick={closeModal}>
                    Cancel
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}
        </div>
    </div>
  );
}

export default Calendar;
