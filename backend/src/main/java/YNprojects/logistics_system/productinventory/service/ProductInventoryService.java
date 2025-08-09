package YNprojects.logistics_system.productinventory.service;

import YNprojects.logistics_system.exceptions.ResourceNotFoundException;
import YNprojects.logistics_system.productinventory.mapper.ProductInventoryMapper;
import YNprojects.logistics_system.product.entity.Product;
import YNprojects.logistics_system.productinventory.dto.ProductInventoryDto;
import YNprojects.logistics_system.productinventory.entities.ProductInventory;
import YNprojects.logistics_system.productinventory.repository.ProductInventoryRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ProductInventoryService {

    private final ProductInventoryRepo productInventoryRepo;

    public List<ProductInventoryDto> getAllProductInventory() {
        return productInventoryRepo.findAll().stream().map(ProductInventoryMapper::toProductInventoryDto).collect(Collectors.toList());
    }

    public ProductInventoryDto getProductInventoryById(Long id) {
        ProductInventory productInventory = productInventoryRepo.findById(id).orElseThrow(
                ()->new ResourceNotFoundException("This inventory item doesn't exist.")
        );
        return ProductInventoryMapper.toProductInventoryDto(productInventory);
    }

    public ProductInventory createProductInventory(Product product) {
        ProductInventory productInventory = new ProductInventory();
        productInventory.setQuantity(0.0);
        productInventory.setReorderThreshold(0.0);
        productInventory.setLastUpdated(LocalDateTime.now());
        productInventory.setProduct(product);
        return productInventoryRepo.save(productInventory);
    }

    @Transactional
    public ProductInventoryDto updateProductInventory(ProductInventoryDto productInventoryDto) {
        ProductInventory productInventory = productInventoryRepo.findById(productInventoryDto.getId()).orElseThrow(
                ()->new ResourceNotFoundException("This product inventory item doesn't exist.")
        );
        productInventory.setLastUpdated(LocalDateTime.now());
        productInventory.setQuantity(productInventoryDto.getQuantity());
        productInventory.setReorderThreshold(productInventoryDto.getReorderThreshold());

        if(productInventory.getQuantity() <= productInventory.getReorderThreshold()){
            //create alert
        } else {
            //delete alert
        }
        ProductInventory saved = productInventoryRepo.save(productInventory);
        return ProductInventoryMapper.toProductInventoryDto(saved);
    }




}
