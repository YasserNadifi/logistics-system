package YNprojects.logistics_system.services;

import YNprojects.logistics_system.DTO.InventoryDto;
import YNprojects.logistics_system.DTO.ProductDto;
import YNprojects.logistics_system.entities.Inventory;
import YNprojects.logistics_system.entities.Product;
import YNprojects.logistics_system.exceptions.ResourceNotFoundException;
import YNprojects.logistics_system.mapper.InventoryMapper;
import YNprojects.logistics_system.repositories.InventoryRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class InventoryService {

    private final InventoryRepo inventoryRepo;

    public List<InventoryDto> getAllInventory() {
        return inventoryRepo.findAll().stream().map(InventoryMapper::toInventoryDto).collect(Collectors.toList());
    }

    public InventoryDto getInventoryById(Long id) {
        Inventory inventory = inventoryRepo.findById(id).orElseThrow(
                ()->new ResourceNotFoundException("This inventory item doesn't exist.")
        );
        return InventoryMapper.toInventoryDto(inventory);
    }

    public Inventory createInventory(Product product) {
        Inventory inventory = new Inventory();
        inventory.setQuantity(0.0);
        inventory.setReorderThreshold(0.0);
        inventory.setLastUpdated(LocalDateTime.now());
        inventory.setProduct(product);
        return inventoryRepo.save(inventory);
    }

    public InventoryDto updateInventory(InventoryDto inventoryDto) {
        Inventory inventory = inventoryRepo.findById(inventoryDto.getId()).orElseThrow(
                ()->new ResourceNotFoundException("This inventory item doesn't exist.")
        );;
        inventory.setLastUpdated(LocalDateTime.now());
        inventory.setQuantity(inventoryDto.getQuantity());
        inventory.setReorderThreshold(inventoryDto.getReorderThreshold());
        Inventory updated = inventoryRepo.save(inventory);
        return InventoryMapper.toInventoryDto(updated);
    }

}
