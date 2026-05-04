package com.ticketing.controller;

import com.ticketing.dto.TicketDTO;
import com.ticketing.entity.Ticket;
import com.ticketing.entity.User;
import com.ticketing.service.TicketService;
import com.ticketing.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    
    private final TicketService ticketService;
    private final UserService userService;
    
@PostMapping
    public ResponseEntity<TicketDTO.TicketResponse> createTicket(
            @RequestBody TicketDTO.CreateRequest request,
            HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(ticketService.createTicket(request, userId));
    }
    
    @GetMapping("/my")
    public ResponseEntity<List<TicketDTO.TicketResponse>> getMyTickets(
            HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(ticketService.getUserTickets(userId));
    }
    
    @GetMapping("/assigned")
    public ResponseEntity<List<TicketDTO.TicketResponse>> getAssignedTickets(
            HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(ticketService.getAssignedTickets(userId));
    }
    
    @GetMapping
    public ResponseEntity<List<TicketDTO.TicketResponse>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO.TicketResponse> getTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TicketDTO.TicketResponse> updateTicket(
            @PathVariable Long id,
            @RequestBody TicketDTO.UpdateRequest request,
            HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        String role = (String) req.getAttribute("role");
        return ResponseEntity.ok(ticketService.updateTicket(id, request, userId, role));
    }
    
    @PostMapping("/{id}/assign")
    public ResponseEntity<TicketDTO.TicketResponse> assignTicket(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body,
            HttpServletRequest req) {
        String role = (String) req.getAttribute("role");
        return ResponseEntity.ok(ticketService.assignTicket(id, body.get("assignedTo"), role));
    }
    
    @PostMapping("/{id}/resolve")
    public ResponseEntity<TicketDTO.TicketResponse> resolveTicket(
            @PathVariable Long id,
            HttpServletRequest req) {
        String role = (String) req.getAttribute("role");
        return ResponseEntity.ok(ticketService.resolveTicket(id, role));
    }
    
    @PostMapping("/{id}/close")
    public ResponseEntity<TicketDTO.TicketResponse> closeTicket(
            @PathVariable Long id,
            HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        String role = (String) req.getAttribute("role");
        return ResponseEntity.ok(ticketService.closeTicket(id, userId, role));
    }
    
    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketDTO.CommentResponse> addComment(
            @PathVariable Long id,
            @RequestBody TicketDTO.CommentRequest request,
            HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(ticketService.addComment(id, request, userId));
    }
    
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketDTO.CommentResponse>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketComments(id));
    }
    
    @PostMapping("/{id}/rate")
    public ResponseEntity<TicketDTO.TicketResponse> rateTicket(
            @PathVariable Long id,
            @RequestBody TicketDTO.RatingRequest request,
            HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(ticketService.rateTicket(id, request, userId));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<TicketDTO.TicketResponse>> searchTickets(
            @RequestParam String q) {
        return ResponseEntity.ok(ticketService.searchTickets(q));
    }
    
    @GetMapping("/filter/status")
    public ResponseEntity<List<TicketDTO.TicketResponse>> filterByStatus(
            @RequestParam Ticket.TicketStatus status) {
        return ResponseEntity.ok(ticketService.filterByStatus(status));
    }
    
    @GetMapping("/filter/priority")
    public ResponseEntity<List<TicketDTO.TicketResponse>> filterByPriority(
            @RequestParam Ticket.Priority priority) {
        return ResponseEntity.ok(ticketService.filterByPriority(priority));
    }
}
