import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

interface Booking {
  id: number;
  room_id: number;
  start_time: string;
  end_time: string;
  title: string;
  invitees: string[];
}

const ConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get<Booking>(`/bookings/${id}`)
      .then((response) => setBooking(response.data))
      .catch((error) => console.error("Error fetching booking:", error));
  }, [id]);

  const handleCancel = () => {
    axios
      .delete(`/bookings/${id}`)
      .then(() => navigate("/"))
      .catch((error) =>
        alert(
          "Error canceling booking: " + error.response?.data?.detail ||
            error.message
        )
      );
  };

  const handleBackHome = () => {
    navigate("/");
  };

  if (!booking) return <Typography>Loading...</Typography>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Booking Confirmation
      </Typography>
      <Typography>Booking ID: {booking.id}</Typography>
      <Typography>Room ID: {booking.room_id}</Typography>
      <Typography>Start Time: {booking.start_time}</Typography>
      <Typography>End Time: {booking.end_time}</Typography>
      <Typography>Title: {booking.title}</Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Invitees
      </Typography>
      <List>
        {booking.invitees.map((email) => (
          <ListItem key={email}>
            <ListItemText primary={email} />
          </ListItem>
        ))}
      </List>
      <Button
        variant="contained"
        color="error"
        onClick={handleCancel}
        sx={{ mt: 2, mr: 2 }}
      >
        Cancel Booking
      </Button>
      <Button variant="contained" onClick={handleBackHome} sx={{ mt: 2 }}>
        Back Home
      </Button>
    </Container>
  );
};

export default ConfirmationPage;
