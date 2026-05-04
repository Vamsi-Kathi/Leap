package com.ticketing.dto;

import com.ticketing.entity.Ticket;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

public class TicketDTO {
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        private String subject;
        private String description;
        private Ticket.Priority priority;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String subject;
        private String description;
        private Ticket.Priority priority;
        private Ticket.TicketStatus status;
        private Long assignedTo;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TicketResponse {
        private Long id;
        private String subject;
        private String description;
        private Ticket.Priority priority;
        private Ticket.TicketStatus status;
        private Long createdBy;
        private String createdByName;
        private Long assignedTo;
        private String assignedToName;
        private Integer rating;
        private String feedback;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime resolvedAt;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CommentRequest {
        private String content;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CommentResponse {
        private Long id;
        private Long ticketId;
        private Long userId;
        private String userName;
        private String content;
        private LocalDateTime createdAt;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RatingRequest {
        private Integer rating;
        private String feedback;
    }
}
