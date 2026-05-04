package com.ticketing.repository;

import com.ticketing.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    List<Ticket> findByCreatedBy(Long userId);
    
    List<Ticket> findByAssignedTo(Long userId);
    
    @Query("SELECT t FROM Ticket t WHERE t.status = :status")
    List<Ticket> findByStatus(@Param("status") Ticket.TicketStatus status);
    
    @Query("SELECT t FROM Ticket t WHERE t.priority = :priority")
    List<Ticket> findByPriority(@Param("priority") Ticket.Priority priority);
    
    @Query("SELECT t FROM Ticket t WHERE t.subject LIKE %:search% OR t.description LIKE %:search%")
    List<Ticket> searchTickets(@Param("search") String search);
    
    List<Ticket> findByAssignedToOrCreatedBy(Long assignedTo, Long createdBy);
}
