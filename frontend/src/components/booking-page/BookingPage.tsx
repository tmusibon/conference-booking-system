import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Room {
  id: number;
  name: string;
  location: string;
  equipment: string;
  capacity: number;
}

interface User {
  email: string;
  name: string;
}

const BookingPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    room_id: 0,
    start_time: new Date(),
    end_time: new Date(),
    title: "",
    invitees: [] as string[],
  });
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get<Room[]>("http://localhost:8000/rooms")
      .then((response) => setRooms(response.data));
    axios
      .get<User[]>("http://localhost:8000/users")
      .then((response) => setUsers(response.data));
  }, []);

  const handleSubmit = () => {
    const bookingData = {
      room_id: formData.room_id,
      start_time: formData.start_time.toISOString(),
      end_time: formData.end_time.toISOString(),
      title: formData.title,
      invitees: formData.invitees,
    };
    axios
      .post("http://localhost:8000/bookings", bookingData)
      .then((response) => navigate(`/confirmation/${response.data.id}`))
      .catch((error) =>
        alert(
          "Error creating booking: " + error.response?.data?.detail ||
            error.message
        )
      );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container>
        <Typography variant="h4" gutterBottom>
          Book a Room
        </Typography>
        <FormControl fullWidth margin="normal">
          <InputLabel>Room</InputLabel>
          <Select
            value={formData.room_id}
            onChange={(e) =>
              setFormData({ ...formData, room_id: Number(e.target.value) })
            }
          >
            <MenuItem value={0} disabled>
              Select a room
            </MenuItem>
            {rooms.map((room) => (
              <MenuItem key={room.id} value={room.id}>
                {room.name} - {room.location}, {room.equipment}, Capacity:{" "}
                {room.capacity}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <DateTimePicker
          label="Start Time"
          value={formData.start_time}
          onChange={(value) =>
            value && setFormData({ ...formData, start_time: value })
          }
          slotProps={{
            textField: {
              fullWidth: true,
              margin: "normal",
            },
          }}
        />
        <DateTimePicker
          label="End Time"
          value={formData.end_time}
          onChange={(value) =>
            value && setFormData({ ...formData, end_time: value })
          }
          slotProps={{
            textField: {
              fullWidth: true,
              margin: "normal",
            },
          }}
        />
        <TextField
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Invitees</InputLabel>
          <Select
            multiple
            value={formData.invitees}
            onChange={(e) =>
              setFormData({ ...formData, invitees: e.target.value as string[] })
            }
          >
            {users.map((user) => (
              <MenuItem key={user.email} value={user.email}>
                {user.name} ({user.email})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>
          Book
        </Button>
      </Container>
    </LocalizationProvider>
  );
};

export default BookingPage;
