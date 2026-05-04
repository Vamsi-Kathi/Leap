package com.ticketing.service;

import com.ticketing.dto.TicketDTO;
import com.ticketing.entity.Comment;
import com.ticketing.entity.Ticket;
import com.ticketing.entity.User;
import com.ticketing.repository.CommentRepository;
import com.ticketing.repository.TicketRepository;
import com.ticketing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    @Transactional
    public TicketDTO.TicketResponse createTicket(TicketDTO.CreateRequest request, Long userId) {
        Ticket ticket = Ticket.builder()
                .subject(request.getSubject())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : Ticket.Priority.MEDIUM)
                .status(Ticket.TicketStatus.OPEN)
                .createdBy(userId)
                .build();

        ticket = ticketRepository.save(ticket);
        return mapToTicketResponse(ticket);
    }

    public List<TicketDTO.TicketResponse> getUserTickets(Long userId) {
        return ticketRepository.findByCreatedBy(userId).stream()
                .map(this::mapToTicketResponse)
                .collect(Collectors.toList());
    }

    public List<TicketDTO.TicketResponse> getAssignedTickets(Long userId) {
        return ticketRepository.findByAssignedTo(userId).stream()
                .map(this::mapToTicketResponse)
                .collect(Collectors.toList());
    }

    public List<TicketDTO.TicketResponse> getAgentTickets(Long userId) {
        return ticketRepository.findByAssignedToOrCreatedBy(userId, userId).stream()
                .map(this::mapToTicketResponse)
                .collect(Collectors.toList());
    }

    public List<TicketDTO.TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToTicketResponse)
                .collect(Collectors.toList());
    }

    public TicketDTO.TicketResponse getTicketById(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return mapToTicketResponse(ticket);
    }

    @Transactional
    public TicketDTO.TicketResponse updateTicket(Long ticketId, TicketDTO.UpdateRequest request, Long userId, String role) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        boolean isAdmin = role.equals("ADMIN");
        boolean isAgent = role.equals("SUPPORT_AGENT");
        boolean isOwner = ticket.getCreatedBy().equals(userId);
        boolean isAssignee = ticket.getAssignedTo() != null && ticket.getAssignedTo().equals(userId);

        if (!isAdmin && !isOwner && !(isAgent && isAssignee)) {
            throw new RuntimeException("Access denied");
        }

        if (request.getSubject() != null && (isAdmin || isOwner)) {
            ticket.setSubject(request.getSubject());
        }
        if (request.getDescription() != null && (isAdmin || isOwner)) {
            ticket.setDescription(request.getDescription());
        }
        if (request.getPriority() != null && (isAdmin || isAgent || isOwner)) {
            ticket.setPriority(request.getPriority());
        }
        if (request.getStatus() != null && (isAdmin || isAgent)) {
            ticket.setStatus(request.getStatus());
            if (request.getStatus() == Ticket.TicketStatus.RESOLVED) {
                ticket.setResolvedAt(LocalDateTime.now());
            }
        }
        if (request.getAssignedTo() != null && (isAdmin || isAgent)) {
            ticket.setAssignedTo(request.getAssignedTo());
        }

        ticket = ticketRepository.save(ticket);
        return mapToTicketResponse(ticket);
    }

    @Transactional
    public TicketDTO.TicketResponse assignTicket(Long ticketId, Long assignedTo, String role) {
        if (!role.equals("ADMIN") && !role.equals("SUPPORT_AGENT")) {
            throw new RuntimeException("Access denied");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setAssignedTo(assignedTo);
        if (ticket.getStatus() == Ticket.TicketStatus.OPEN) {
            ticket.setStatus(Ticket.TicketStatus.IN_PROGRESS);
        }
        ticket = ticketRepository.save(ticket);

        return mapToTicketResponse(ticket);
    }

    @Transactional
    public TicketDTO.TicketResponse resolveTicket(Long ticketId, String role) {
        if (!role.equals("ADMIN") && !role.equals("SUPPORT_AGENT")) {
            throw new RuntimeException("Access denied");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(Ticket.TicketStatus.RESOLVED);
        ticket.setResolvedAt(LocalDateTime.now());
        ticket = ticketRepository.save(ticket);

        return mapToTicketResponse(ticket);
    }

    @Transactional
    public TicketDTO.TicketResponse closeTicket(Long ticketId, Long userId, String role) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!role.equals("ADMIN") && !ticket.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        ticket.setStatus(Ticket.TicketStatus.CLOSED);
        ticket = ticketRepository.save(ticket);

        return mapToTicketResponse(ticket);
    }

    @Transactional
    public TicketDTO.TicketResponse forceCloseTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus(Ticket.TicketStatus.CLOSED);
        ticket = ticketRepository.save(ticket);
        return mapToTicketResponse(ticket);
    }

    @Transactional
    public TicketDTO.CommentResponse addComment(Long ticketId, TicketDTO.CommentRequest request, Long userId) {
        ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        Comment comment = Comment.builder()
                .ticketId(ticketId)
                .userId(userId)
                .content(request.getContent())
                .build();

        comment = commentRepository.save(comment);
        return mapToCommentResponse(comment);
    }

    public List<TicketDTO.CommentResponse> getTicketComments(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TicketDTO.TicketResponse rateTicket(Long ticketId, TicketDTO.RatingRequest request, Long userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Only the ticket creator can rate it");
        }

        if (ticket.getStatus() != Ticket.TicketStatus.RESOLVED && ticket.getStatus() != Ticket.TicketStatus.CLOSED) {
            throw new RuntimeException("Can only rate resolved or closed tickets");
        }

        ticket.setRating(request.getRating());
        ticket.setFeedback(request.getFeedback());
        ticket = ticketRepository.save(ticket);

        return mapToTicketResponse(ticket);
    }

    public List<TicketDTO.TicketResponse> searchTickets(String query) {
        return ticketRepository.searchTickets(query).stream()
                .map(this::mapToTicketResponse)
                .collect(Collectors.toList());
    }

    public List<TicketDTO.TicketResponse> filterByStatus(Ticket.TicketStatus status) {
        return ticketRepository.findByStatus(status).stream()
                .map(this::mapToTicketResponse)
                .collect(Collectors.toList());
    }

    public List<TicketDTO.TicketResponse> filterByPriority(Ticket.Priority priority) {
        return ticketRepository.findByPriority(priority).stream()
                .map(this::mapToTicketResponse)
                .collect(Collectors.toList());
    }

    private TicketDTO.TicketResponse mapToTicketResponse(Ticket ticket) {
        String createdByName = userRepository.findById(ticket.getCreatedBy())
                .map(User::getFullName)
                .orElse("Unknown");

        String assignedToName = ticket.getAssignedTo() != null ?
                userRepository.findById(ticket.getAssignedTo())
                        .map(User::getFullName)
                        .orElse("Unknown") : null;

        return TicketDTO.TicketResponse.builder()
                .id(ticket.getId())
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .createdBy(ticket.getCreatedBy())
                .createdByName(createdByName)
                .assignedTo(ticket.getAssignedTo())
                .assignedToName(assignedToName)
                .rating(ticket.getRating())
                .feedback(ticket.getFeedback())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .build();
    }

    private TicketDTO.CommentResponse mapToCommentResponse(Comment comment) {
        String userName = userRepository.findById(comment.getUserId())
                .map(User::getFullName)
                .orElse("Unknown");

        return TicketDTO.CommentResponse.builder()
                .id(comment.getId())
                .ticketId(comment.getTicketId())
                .userId(comment.getUserId())
                .userName(userName)
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
