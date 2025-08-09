package YNprojects.logistics_system.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
public class Inventory {
    protected Double quantity;
    protected Double reorderThreshold;
    protected LocalDateTime lastUpdated;
}
