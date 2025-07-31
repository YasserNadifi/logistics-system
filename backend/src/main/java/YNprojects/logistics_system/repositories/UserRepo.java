package YNprojects.logistics_system.repositories;

import YNprojects.logistics_system.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepo extends JpaRepository<User, Long> {
}
