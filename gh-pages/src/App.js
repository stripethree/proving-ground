import React from "react";
// import React, { useState } from 'react';

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";
import Row from "react-bootstrap/Row";

import MyNavbar from "./Navbar.js";

import "./App.css";

const WelcomeJumbotron = () => (
  <Jumbotron>
    <h1 className="header">Welcome to the proving ground</h1>
  </Jumbotron>
);

const App = () => (
  <Container>
    <WelcomeJumbotron />
    <MyNavbar />
    <Row>
      <Col>Col 1</Col>
      <Col>Col 2</Col>
      <Col>Col 3</Col>
    </Row>
  </Container>
);

export default App;
