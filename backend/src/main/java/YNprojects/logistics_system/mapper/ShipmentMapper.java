package YNprojects.logistics_system.mapper;

import YNprojects.logistics_system.DTO.ShipmentDto;
import YNprojects.logistics_system.entities.Shipment;

public class ShipmentMapper {

    public static ShipmentDto toShipmentDto(Shipment shipment) {
        ShipmentDto shipmentDto = new ShipmentDto();
        shipmentDto.setId(shipment.getId());
        shipmentDto.setReferenceCode(shipment.getReferenceCode());
        shipmentDto.setQuantity(shipment.getQuantity());
        shipmentDto.setDepartureDate(shipment.getDepartureDate());
        shipmentDto.setEstimateArrivalDate(shipment.getEstimateArrivalDate());
        shipmentDto.setActualArrivalDate(shipment.getActualArrivalDate());
        shipmentDto.setStatus(shipment.getStatus());
        shipmentDto.setTransportMode(shipment.getTransportMode());
        shipmentDto.setDestination(shipment.getDestination());
        shipmentDto.setTrackingNumber(shipment.getTrackingNumber());
        shipmentDto.setCreatedAt(shipment.getCreatedAt());
        shipmentDto.setProductDto(ProductMapper.toProductDto(shipment.getProduct()));
        return shipmentDto;
    }

    public static Shipment toShipment(ShipmentDto shipmentDto) {
        Shipment shipment = new Shipment();
        shipment.setReferenceCode(shipmentDto.getReferenceCode());
        shipment.setQuantity(shipmentDto.getQuantity());
        shipment.setDepartureDate(shipmentDto.getDepartureDate());
        shipment.setEstimateArrivalDate(shipmentDto.getEstimateArrivalDate());
        shipment.setActualArrivalDate(shipmentDto.getActualArrivalDate());
        shipment.setStatus(shipmentDto.getStatus());
        shipment.setTransportMode(shipmentDto.getTransportMode());
        shipment.setDestination(shipmentDto.getDestination());
        shipment.setTrackingNumber(shipmentDto.getTrackingNumber());
        shipment.setCreatedAt(shipmentDto.getCreatedAt());
        shipment.setProduct(ProductMapper.toProduct(shipmentDto.getProductDto()));
        return shipment;
    }
}
