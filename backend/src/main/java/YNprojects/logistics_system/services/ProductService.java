package YNprojects.logistics_system.services;

import YNprojects.logistics_system.DTO.CreateProductDto;
import YNprojects.logistics_system.DTO.ProductDto;
import YNprojects.logistics_system.entities.Product;
import YNprojects.logistics_system.mapper.ProductMapper;
import YNprojects.logistics_system.repositories.InventoryRepo;
import YNprojects.logistics_system.repositories.ProductRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ProductService {

    private final ProductRepo productRepo;
    private final InventoryService inventoryService;

    public List<ProductDto> getAllProducts() {
        return productRepo.findAll().stream().map(ProductMapper::toProductDto).toList();
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepo.findById(id).orElse(null/*add logic or exception+handlers here*/);
        return ProductMapper.toProductDto(product);
    }

    public ProductDto createProduct(CreateProductDto createProductDto) {
        Product product = new Product();
        product.setName(createProductDto.getName());
        product.setDescription(createProductDto.getDescription());
        product.setUnit(createProductDto.getUnit());
        product.setSku(createProductDto.getSku());
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        product = productRepo.save(product);
        inventoryService.createInventory(product);
        return ProductMapper.toProductDto(product);
    }

    public ProductDto updateProduct(ProductDto productDto) {
        Product product = productRepo.findById(productDto.getId()).orElse(null/*add logic or exception+handlers here*/);
        product.setName(productDto.getName());
        product.setDescription(productDto.getDescription());
        product.setUnit(productDto.getUnit());
        product.setSku(productDto.getSku());
        product.setUpdatedAt(LocalDateTime.now());
        Product updated = productRepo.save(product);
        return ProductMapper.toProductDto(updated);
    }

}
