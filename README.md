# Time-Locked Note Web Application

## Overview

This project is a **Time-Locked Note Web Application** that allows users to securely save notes that will only be revealed after a specified period. It's perfect for storing sensitive information, such as passwords or private messages, that should only be accessed at a specific time in the future.

### Features

- **User Authentication**: Optional password protection for accessing and decrypting the note.
- **Countdown Timer**: A dynamic countdown timer displays the time remaining until the note can be revealed.
- **Note Encryption**: Uses the Web Crypto API to securely encrypt notes before saving them in local storage.
- **Enhanced User Interface**: Simple, intuitive design for a user-friendly experience.

### How It Works

1. **Save a Note**: The user writes a note, sets a timer (in seconds), and provides a password to encrypt the note.
2. **Encryption**: The note is encrypted using the password and stored in the browser’s local storage.
3. **Countdown Timer**: A countdown timer shows how much time is left until the note can be revealed.
4. **Reveal the Note**: Once the timer expires, the user is prompted to enter the password to decrypt and view the note.

### Technologies Used

- **HTML**: Provides the structure of the web page.
- **CSS**: Adds styling and enhances the user interface.
- **JavaScript**: Handles note encryption, countdown timer, and local storage functionality.
- **Web Crypto API**: Used for secure encryption and decryption of notes.

