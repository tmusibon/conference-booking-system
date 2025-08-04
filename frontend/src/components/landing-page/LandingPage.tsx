import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Room {
  id: number;
  name: string;
  location: string;
  equipment: string;
  capacity: number;
}

interface Booking {
  id: number;
  room_id: number;
  start_time: string;
  end_time: string;
  title: string;
}

interface AvailabilityEvent {
  room_id: number;
  start_time: string;
  end_time: string;
  status: string;
}

const LandingPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availability, setAvailability] = useState<AvailabilityEvent[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get<Room[]>("http://localhost:8000/rooms")
      .then((response) => setRooms(response.data))
      .catch((error) => console.error("Error fetching rooms:", error));

    const today = new Date().toISOString().split("T")[0];
    console.log("Today:", today);
    axios
      .get<Booking[]>("http://localhost:8000/bookings")
      .then((response) => {
        console.log("All bookings:", response.data);
        const todayBookings = response.data.filter((booking) => {
          const bookingDate = booking.start_time.split("T")[0];
          console.log(
            "Booking date:",
            bookingDate,
            "Matches today:",
            bookingDate === today
          );
          return bookingDate === today;
        });
        console.log("Today’s bookings:", todayBookings);
        setBookings(todayBookings);
      })
      .catch((error) => console.error("Error fetching bookings:", error));

    // This subscride to SSE
    const eventSource = new EventSource(
      "http://localhost:8000/room-availability"
    );
    eventSource.onmessage = (event) => {
      const data: AvailabilityEvent = JSON.parse(event.data);
      setAvailability((prev) => [...prev, data]);
    };
    eventSource.onerror = () => {
      console.error("SSE error");
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Welcome to Conference Room Booking
      </Typography>
      <Button variant="contained" onClick={() => navigate("/booking")}>
        Book a Room
      </Button>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Available Rooms
      </Typography>
      <List>
        {rooms.map((room) => (
          <ListItem key={room.id}>
            <ListItemText
              primary={room.name}
              secondary={`Location: ${room.location}, Equipment: ${room.equipment}, Capacity: ${room.capacity}`}
            />
          </ListItem>
        ))}
      </List>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Today’s Bookings
      </Typography>
      <List>
        {bookings.length === 0 ? (
          <ListItem>
            <ListItemText primary="No bookings for today" />
          </ListItem>
        ) : (
          bookings.map((booking) => (
            <ListItem key={booking.id}>
              <ListItemText
                primary={booking.title}
                secondary={`Room ${booking.room_id}, ${booking.start_time} - ${booking.end_time}`}
              />
            </ListItem>
          ))
        )}
      </List>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Recent Availability Updates
      </Typography>
      <List>
        {availability.map((event, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={`Room ${event.room_id} - ${event.status}`}
              secondary={`${event.start_time} to ${event.end_time}`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default LandingPage;
