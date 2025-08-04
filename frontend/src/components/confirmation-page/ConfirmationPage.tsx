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
      .get(`http://localhost:8000/bookings/${id}`)
      .then((response) => setBooking(response.data))
      .catch((error) => console.error("Error fetching booking:", error));
  }, [id]);

  const handleCancel = () => {
    axios
      .delete(`http://localhost:8000/bookings/${id}`)
      .then(() => navigate("/"))
      .catch((error) =>
        alert(
          "Error canceling booking: " + error.response?.data?.detail ||
            error.message
        )
      );
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
      <Typography variant="h6" style={{ marginTop: "10px" }}>
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
        style={{ marginTop: "20px" }}
      >
        Cancel Booking
      </Button>
    </Container>
  );
};

export default ConfirmationPage;
