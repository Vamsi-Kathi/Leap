package com.ticketing;

import com.ticketing.entity.Ticket;
import com.ticketing.entity.User;
import com.ticketing.repository.TicketRepository;
import com.ticketing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            System.out.println("Database already seeded");
            return;
        }
        
        System.out.println("Seeding database with initial data...");
        
        // Create Users
        User admin = User.builder()
                .email("admin@ticketing.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("System Admin")
                .role(User.Role.ADMIN)
                .active(true)
                .build();
        admin = userRepository.save(admin);
        
        User agent = User.builder()
                .email("agent@ticketing.com")
                .password(passwordEncoder.encode("agent123"))
                .fullName("John Support Agent")
                .role(User.Role.SUPPORT_AGENT)
                .active(true)
                .build();
        agent = userRepository.save(agent);
        
        User agent2 = User.builder()
                .email("agent2@ticketing.com")
                .password(passwordEncoder.encode("agent123"))
                .fullName("Jane Support")
                .role(User.Role.SUPPORT_AGENT)
                .active(true)
                .build();
        agent2 = userRepository.save(agent2);
        
        User user1 = User.builder()
                .email("user@ticketing.com")
                .password(passwordEncoder.encode("user123"))
                .fullName("Alice User")
                .role(User.Role.USER)
                .active(true)
                .build();
        user1 = userRepository.save(user1);
        
        User user2 = User.builder()
                .email("bob@ticketing.com")
                .password(passwordEncoder.encode("user123"))
                .fullName("Bob Customer")
                .role(User.Role.USER)
                .active(true)
                .build();
        user2 = userRepository.save(user2);
        
        // Create Tickets
        List<Ticket> tickets = List.of(
            Ticket.builder()
                    .subject("Cannot login to my account")
                    .description("I have been trying to login for the past hour but keep getting an error message. Please help!")
                    .priority(Ticket.Priority.HIGH)
                    .status(Ticket.TicketStatus.OPEN)
                    .createdBy(user1.getId())
                    .build(),
            Ticket.builder()
                    .subject("Feature request: Dark mode")
                    .description("Would love to have a dark mode option in the application. Many users prefer it for night use.")
                    .priority(Ticket.Priority.LOW)
                    .status(Ticket.TicketStatus.OPEN)
                    .createdBy(user2.getId())
                    .build(),
            Ticket.builder()
                    .subject("Payment not processed")
                    .description("My payment was deducted but the order shows pending. I need urgent help.")
                    .priority(Ticket.Priority.URGENT)
                    .status(Ticket.TicketStatus.IN_PROGRESS)
                    .createdBy(user1.getId())
                    .assignedTo(agent.getId())
                    .build(),
            Ticket.builder()
                    .subject("How to change password?")
                    .description("I want to update my password but cannot find the setting. Please guide me.")
                    .priority(Ticket.Priority.MEDIUM)
                    .status(Ticket.TicketStatus.RESOLVED)
                    .createdBy(user2.getId())
                    .assignedTo(agent2.getId())
                    .resolvedAt(LocalDateTime.now().minusHours(2))
                    .rating(5)
                    .feedback("Excellent support, got answer within 10 minutes!")
                    .build(),
            Ticket.builder()
                    .subject("API documentation missing")
                    .description("The API documentation is incomplete. Missing endpoint for user profile update.")
                    .priority(Ticket.Priority.MEDIUM)
                    .status(Ticket.TicketStatus.CLOSED)
                    .createdBy(user1.getId())
                    .assignedTo(agent.getId())
                    .resolvedAt(LocalDateTime.now().minusDays(1))
                    .rating(4)
                    .feedback("Good response time, issue resolved")
                    .build()
        );
        
        ticketRepository.saveAll(tickets);
        
        System.out.println("Database seeded successfully!");
        System.out.println("Test credentials:");
        System.out.println("  Admin: admin@ticketing.com / admin123");
        System.out.println("  Agent: agent@ticketing.com / agent123");
        System.out.println("  User:  user@ticketing.com / user123");
    }
}
