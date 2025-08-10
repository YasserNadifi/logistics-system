package YNprojects.logistics_system.shipment.service;

import YNprojects.logistics_system.exceptions.ResourceNotFoundException;
import YNprojects.logistics_system.rawmaterialinventory.entity.RawMaterialInventory;
import YNprojects.logistics_system.rawmaterialinventory.repository.RawMaterialInventoryRepo;
import YNprojects.logistics_system.shipment.dto.ChangeShipmentStatusDto;
import YNprojects.logistics_system.shipment.dto.ShipmentDto;
import YNprojects.logistics_system.shipment.mapper.ShipmentMapper;
import YNprojects.logistics_system.product.entity.Product;
import YNprojects.logistics_system.product.repository.ProductRepo;
import YNprojects.logistics_system.productinventory.entities.ProductInventory;
import YNprojects.logistics_system.productinventory.repository.ProductInventoryRepo;
import YNprojects.logistics_system.rawmaterial.entity.RawMaterial;
import YNprojects.logistics_system.rawmaterial.repository.RawMaterialRepo;
import YNprojects.logistics_system.shipment.dto.CreateShipmentDto;
import YNprojects.logistics_system.shipment.entity.Shipment;
import YNprojects.logistics_system.shipment.entity.ShipmentDirection;
import YNprojects.logistics_system.shipment.entity.ShipmentStatus;
import YNprojects.logistics_system.supplier.entity.Supplier;
import YNprojects.logistics_system.shipment.repo.ShipmentRepo;
import YNprojects.logistics_system.supplier.repository.SupplierRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
public class ShipmentService {

    private final ProductRepo productRepo;
    private final ShipmentRepo shipmentRepo;
    private final SupplierRepo supplierRepo;
    private final RawMaterialRepo rawMaterialRepo;
    private final ProductInventoryRepo productInventoryRepo;
    private final RawMaterialInventoryRepo rawMaterialInventoryRepo;

    private static int dailyCounter = 0;
    private static LocalDate lastResetDate = LocalDate.now();

    public String generateReference() {
        LocalDate today = LocalDate.now();
        if (!today.equals(lastResetDate)) {
            dailyCounter = 0;
            lastResetDate = today;
        }
        dailyCounter++;
        String sequence = String.format("%03d", dailyCounter);
        return "SHIP-" + today.format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + sequence;
    }

    public List<ShipmentDto> getAllShipment() {
        return shipmentRepo.findAll().stream().map(ShipmentMapper::toDto).collect(Collectors.toList());
    }

    public ShipmentDto getShipmentById(Long id) {
        Shipment shipment = shipmentRepo.findById(id).orElseThrow(
                ()->new ResourceNotFoundException("This shipment doesn't exist.")
        );
        return ShipmentMapper.toDto(shipment);
    }

    @Transactional
    public ShipmentDto createShipment(CreateShipmentDto dto) {
        if (dto == null) throw new IllegalArgumentException("CreateShipmentDto cannot be null");
        if (dto.getQuantity() == null || dto.getQuantity() <= 0) throw new IllegalArgumentException("Quantity must be > 0");
        if (dto.getDirection() == null) throw new IllegalArgumentException("Shipment direction is required");
        if (dto.getTransportMode() == null) throw new IllegalArgumentException("Transport mode is required");
        if (dto.getDepartureDate()==null) throw new IllegalArgumentException("Departure Date is required");

        // build basic entity
        Shipment shipment = new Shipment();
        shipment.setDirection(dto.getDirection());
        shipment.setTransportMode(dto.getTransportMode());
        shipment.setQuantity(dto.getQuantity());
        shipment.setTrackingNumber(dto.getTrackingNumber());
        shipment.setCustomerName(dto.getCustomerName());
        shipment.setDepartureDate(dto.getDepartureDate());
        // note: estimateArrivalDate may be null -> compute below if needed

        // Validate direction-specific fields and resolve references
        if (dto.getDirection() == ShipmentDirection.OUTBOUND) {
            if (dto.getProductId() == null) throw new IllegalArgumentException("Outbound shipment requires productId");
            Product product = productRepo.findById(dto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + dto.getProductId()));
            shipment.setProduct(product);
        } else { // INBOUND
            if (dto.getRawMaterialId() == null) throw new IllegalArgumentException("Inbound shipment requires rawMaterialId");
            if (dto.getSupplierId() == null) throw new IllegalArgumentException("Inbound shipment requires supplierId");
            RawMaterial raw = rawMaterialRepo.findById(dto.getRawMaterialId())
                    .orElseThrow(() -> new ResourceNotFoundException("Raw material not found: " + dto.getRawMaterialId()));
            Supplier sup = supplierRepo.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + dto.getSupplierId()));
            shipment.setRawMaterial(raw);
            shipment.setSupplier(sup);
        }

        // -------------- estimateArrivalDate auto-calculation --------------
        // Only calculate if DTO didn't provide one (i.e. not overridden)
        LocalDate departure = shipment.getDepartureDate();
        LocalDate estimate = dto.getEstimateArrivalDate();
        if (estimate == null) {
            // simple defaults per transport mode
            Integer defaultDays;
            switch (dto.getTransportMode()) {
                case AIR: defaultDays = 1; break;
                case TRUCK: defaultDays = 2; break;
                case SEA: defaultDays = 21; break;
                default: defaultDays = 3; // fallback
            }
            if (departure != null) {
                estimate = departure.plusDays(defaultDays);
            }
        }
        shipment.setEstimateArrivalDate(estimate);

        // -------------- determine initial status using provided logic --------------
        LocalDate today = LocalDate.now();
        ShipmentStatus status;
        if (departure == null) {
            // no departure set -> planned
            status = ShipmentStatus.PLANNED;
        } else {
            // use the exact condition you gave
            if (departure.isAfter(today)) {
                status = ShipmentStatus.PLANNED;
            } else if ((!departure.isAfter(today)) && (estimate != null && !estimate.isBefore(today))) {
                status = ShipmentStatus.IN_TRANSIT;
            } else {
                status = ShipmentStatus.DELAYED;
            }
        }
        shipment.setStatus(status);

        // -------------- Inventory side-effects --------------
        // OUTBOUND: reserve (deduct) finished product inventory immediately at creation
        if (shipment.getDirection() == ShipmentDirection.OUTBOUND) {
            // IMPORTANT: use a repository method that applies a database lock (PESSIMISTIC_WRITE)
            // e.g. productInventoryRepo.findByProductIdForUpdate(product.getId())
            Product product = shipment.getProduct();
            ProductInventory inv = productInventoryRepo
                    .findByProduct(product) // implement with @Lock(LockModeType.PESSIMISTIC_WRITE)
                    .orElseThrow(() -> new IllegalStateException("No inventory record for product: " + product.getName()));

            double available = inv.getQuantity();
            double qty = shipment.getQuantity();
            if (available < qty) {
                throw new IllegalStateException("Insufficient finished-product stock. Available: " + available + ", required: " + qty);
            }

            inv.setQuantity(available - qty);
            productInventoryRepo.save(inv);
        }
        // INBOUND: no inventory changes now — inventory is increased when shipment marked DELIVERED

        // -------------- finalize shipment entity --------------
        shipment.setReferenceCode(generateReference()); // existing method you mentioned
        shipment.setCreatedAt(LocalDateTime.now());
        shipment.setUpdatedAt(LocalDateTime.now());

        // Persist
        Shipment saved = shipmentRepo.save(shipment);

        // Optional: generate alerts if reservation dropped below threshold
        // if (shipment.getDirection()==OUTBOUND) alertService.checkLowStock(product);

        return ShipmentMapper.toDto(saved);
    }

    @Transactional
    public ShipmentDto changeShipmentStatus(ChangeShipmentStatusDto changeShipmentStatusDto) {

        Long shipmentId = changeShipmentStatusDto.getShipmentId() ;
        ShipmentStatus targetStatus = changeShipmentStatusDto.getTargetStatus();
        if (shipmentId == null || targetStatus == null) {
            throw new IllegalArgumentException("shipmentId and targetStatus are required");
        }

        // 1) Load & lock shipment row to avoid concurrent transitions.
        Shipment shipment = shipmentRepo.findById(shipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found: " + shipmentId));

        ShipmentStatus current = shipment.getStatus();
        if (current == targetStatus) return ShipmentMapper.toDto(shipment); // noop

        // 2) Terminal guard
        if (current == ShipmentStatus.DELIVERED || current == ShipmentStatus.CANCELLED) {
            throw new IllegalStateException("Cannot change status of a terminal shipment: " + current);
        }

        // 3) Validate allowed transitions
        if (!isAllowedShipmentTransition(current, targetStatus)) {
            throw new IllegalStateException("Invalid shipment status transition: " + current + " -> " + targetStatus);
        }

        LocalDate today = LocalDate.now();

        // ---------- Transition implementations ----------
        // PLANNED -> IN_TRANSIT
        if (current == ShipmentStatus.PLANNED && targetStatus == ShipmentStatus.IN_TRANSIT) {
            // set departure date if missing
            if (shipment.getDepartureDate() == null) {
                shipment.setDepartureDate(today);
            }
            shipment.setStatus(ShipmentStatus.IN_TRANSIT);
        }

        // PLANNED -> CANCELLED
        else if (current == ShipmentStatus.PLANNED && targetStatus == ShipmentStatus.CANCELLED) {
            // if outbound we had reserved stock at creation; return it
            if (shipment.getDirection() == ShipmentDirection.OUTBOUND) {
                Product product = shipment.getProduct();
                if (product == null || product.getId() == null) {
                    throw new IllegalStateException("Outbound shipment missing product reference");
                }
                // lock product inventory row
                ProductInventory inv = productInventoryRepo
                        .findByProduct(product)
                        .orElseThrow(() -> new IllegalStateException("No product inventory record for product: " + product.getId()));
                inv.setQuantity(inv.getQuantity() + shipment.getQuantity());
                productInventoryRepo.save(inv);
            }
            shipment.setStatus(ShipmentStatus.CANCELLED);
        }

        // IN_TRANSIT -> DELIVERED
        else if (current == ShipmentStatus.IN_TRANSIT && targetStatus == ShipmentStatus.DELIVERED) {
            // For inbound, add raw materials to inventory
            if (shipment.getDirection() == ShipmentDirection.INBOUND) {
                RawMaterial raw = shipment.getRawMaterial();
                if (raw == null || raw.getId() == null) {
                    throw new IllegalStateException("Inbound shipment missing raw material reference");
                }
                RawMaterialInventory rawInv = rawMaterialInventoryRepo
                        .findByRawMaterial(raw)
                        .orElseThrow(() -> new IllegalStateException("No raw material inventory for id: " + raw.getId()));
                rawInv.setQuantity(rawInv.getQuantity() + shipment.getQuantity());
                rawMaterialInventoryRepo.save(rawInv);
            }
            // For outbound: inventory was already deducted at creation

            // set actual arrival date if missing
            if (shipment.getActualArrivalDate() == null) {
                shipment.setActualArrivalDate(today);
            }
            shipment.setStatus(ShipmentStatus.DELIVERED);
        }

        // IN_TRANSIT -> DELAYED
        else if (current == ShipmentStatus.IN_TRANSIT && targetStatus == ShipmentStatus.DELAYED) {
            shipment.setStatus(ShipmentStatus.DELAYED);
        }

        // DELAYED -> IN_TRANSIT
        else if (current == ShipmentStatus.DELAYED && targetStatus == ShipmentStatus.IN_TRANSIT) {
            // resume transit (optionally set departureDate to today if missing)
            if (shipment.getDepartureDate() == null) {
                shipment.setDepartureDate(today);
            }
            shipment.setStatus(ShipmentStatus.IN_TRANSIT);
        }
        // IN_TRANSIT || DELAYED -> CANCELLED (allow cancelling while in transit)
        else if ((current == ShipmentStatus.IN_TRANSIT || current == ShipmentStatus.DELAYED) && targetStatus == ShipmentStatus.CANCELLED) {
            if (shipment.getDirection() == ShipmentDirection.OUTBOUND) {
                Product product = shipment.getProduct();
                if (product == null || product.getId() == null) {
                    throw new IllegalStateException("Outbound shipment missing product reference");
                }
                ProductInventory inv = productInventoryRepo
                        .findByProduct(product)
                        .orElseThrow(() -> new IllegalStateException("No product inventory record for product: " + product.getId()));
                inv.setQuantity(inv.getQuantity() + shipment.getQuantity());
                productInventoryRepo.save(inv);
            }
            // inbound: nothing to revert (not yet added)
            shipment.setStatus(ShipmentStatus.CANCELLED);
        }

        else {
            // Should never happen because of isAllowedShipmentTransition check above
            throw new IllegalStateException("Unhandled transition: " + current + " -> " + targetStatus);
        }

        shipment.setUpdatedAt(java.time.LocalDateTime.now());

        Shipment saved = shipmentRepo.save(shipment);

        return ShipmentMapper.toDto(saved);
    }

    /** Allowed transitions for the shipment status machine. */
    private boolean isAllowedShipmentTransition(ShipmentStatus from, ShipmentStatus to) {
        if (from == ShipmentStatus.PLANNED) {
            return to == ShipmentStatus.IN_TRANSIT || to == ShipmentStatus.CANCELLED;
        }
        if (from == ShipmentStatus.IN_TRANSIT) {
            return to == ShipmentStatus.DELIVERED || to == ShipmentStatus.DELAYED || to == ShipmentStatus.CANCELLED;
        }
        if (from == ShipmentStatus.DELAYED) {
            return to == ShipmentStatus.IN_TRANSIT || to == ShipmentStatus.CANCELLED;
        }
        // DELIVERED and CANCELLED are terminal
        return false;
    }

}
