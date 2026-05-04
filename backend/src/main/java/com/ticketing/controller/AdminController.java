package com.ticketing.controller;

import com.ticketing.dto.AuthDTO;
import com.ticketing.dto.TicketDTO;
import com.ticketing.entity.User;
import com.ticketing.service.TicketService;
import com.ticketing.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final TicketService ticketService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<AuthDTO.AuthResponse> createUser(@RequestBody AuthDTO.RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        User.Role role = User.Role.valueOf(request.get("role"));
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @PostMapping("/users/{id}/deactivate")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{id}/activate")
    public ResponseEntity<Void> activateUser(@PathVariable Long id) {
        userService.activateUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/agents")
    public ResponseEntity<List<User>> getSupportAgents() {
        return ResponseEntity.ok(userService.getSupportAgents());
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<TicketDTO.TicketResponse>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @PostMapping("/tickets/{id}/force-resolve")
    public ResponseEntity<TicketDTO.TicketResponse> forceResolve(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.resolveTicket(id, "ADMIN"));
    }

    @PostMapping("/tickets/{id}/force-close")
    public ResponseEntity<TicketDTO.TicketResponse> forceClose(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.forceCloseTicket(id));
    }

    @PostMapping("/tickets/{id}/assign")
    public ResponseEntity<TicketDTO.TicketResponse> adminAssign(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(ticketService.assignTicket(id, body.get("assignedTo"), "ADMIN"));
    }
}
