from rest_framework import serializers
from .models import (
    TipoEvento, Bodega, Cliente, Manteleria, Cubierto, Loza, Cristaleria, Silla, Mesa, SalaLounge, 
    Periquera, Carpa, PistaTarima, Extra, Evento, EventoMobiliario, Degustacion, DegustacionMobiliario, Product, Notification,
    HomeSection, HomeSectionImage
)
from django.contrib.contenttypes.models import ContentType

class TipoEventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoEvento
        fields = ['id', 'nombre', 'descripcion']

class BodegaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bodega
        fields = ['id', 'nombre', 'ubicacion', 'descripcion']

class InventarioItemSerializer(serializers.ModelSerializer):
    bodega_nombre = serializers.CharField(source='bodega.nombre', read_only=True)

    class Meta:
        fields = ['id', 'producto', 'descripcion', 'cantidad', 'cantidad_en_mantenimiento', 'bodega', 'bodega_nombre', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'bodega_nombre']


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'nombre', 'apellido', 'tipo_evento', 'cantidad_aprox', 'numero', 'comentarios']

class ManteleriaSerializer(InventarioItemSerializer):
    class Meta(InventarioItemSerializer.Meta):
        model = Manteleria

class CubiertoSerializer(InventarioItemSerializer):
    class Meta(InventarioItemSerializer.Meta):
        model = Cubierto

class LozaSerializer(InventarioItemSerializer):
    class Meta(InventarioItemSerializer.Meta):
        model = Loza

class CristaleriaSerializer(InventarioItemSerializer):
    class Meta(InventarioItemSerializer.Meta):
        model = Cristaleria

class SillaSerializer(InventarioItemSerializer):
    class Meta(InventarioItemSerializer.Meta):
        model = Silla

class MesaSerializer(InventarioItemSerializer):
    class Meta(InventarioItemSerializer.Meta):
        model = Mesa

class SalaLoungeSerializer(InventarioItemSerializer):
    class Meta(InventarioItemSerializer.Meta):
        model = SalaLounge

class PeriqueraSerializer(InventarioItemSerializer):
    class Meta(InventarioItemSerializer.Meta):
        model = Periquera

class CarpaSerializer(InventarioItemSerializer):
    class Meta(InventarioItemSerializer.Meta):
        model = Carpa

class PistaTarimaSerializer(InventarioItemSerializer):
    class Meta(InventarioItemSerializer.Meta):
        model = PistaTarima

class ExtraSerializer(InventarioItemSerializer):
    class Meta(InventarioItemSerializer.Meta):
        model = Extra


class EventoMobiliarioSerializer(serializers.ModelSerializer):
    # Campo para obtener el nombre del producto del mobiliario (solo lectura)
    producto_nombre = serializers.CharField(source='content_object.producto', read_only=True)
    # Campo para identificar el tipo de modelo de mobiliario (ej. 'silla', 'mesa')
    content_type_name = serializers.CharField(source='content_type.model', read_only=True)

    class Meta:
        model = EventoMobiliario
        fields = ['id', 'cantidad', 'content_type', 'object_id', 'producto_nombre', 'content_type_name']


class MobiliarioField(serializers.Field):
    def to_representation(self, value):
        # Esto no se usará para serializar, solo para deserializar
        return []

    def to_internal_value(self, data):
        # `data` es la lista de ítems de mobiliario del frontend
        return data


class EventoSerializer(serializers.ModelSerializer):
    # Serializer anidado para mostrar el mobiliario asignado (solo lectura)
    mobiliario_asignado = EventoMobiliarioSerializer(many=True, read_only=True)
    # Campo para recibir la lista de mobiliario en la creación/actualización (solo escritura)
    mobiliario = MobiliarioField(write_only=True, required=False)
    # Campo para mostrar el nombre del tipo de evento (solo lectura)
    tipo_evento_nombre = serializers.CharField(source='tipo_evento.nombre', read_only=True)

    class Meta:
        model = Evento
        fields = [
            'id', 'nombre', 'tipo_evento', 'tipo_evento_nombre', 'cantidad_personas', 'responsable', 
            'lugar', 'estado', 'fecha_inicio', 'hora_inicio', 'mobiliario_asignado', 'mobiliario',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class DegustacionMobiliarioSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='content_object.producto', read_only=True)
    content_type_name = serializers.CharField(source='content_type.model', read_only=True)

    class Meta:
        model = DegustacionMobiliario
        fields = ['id', 'cantidad', 'content_type', 'object_id', 'producto_nombre', 'content_type_name']


class DegustacionSerializer(serializers.ModelSerializer):
    mobiliario_asignado = DegustacionMobiliarioSerializer(many=True, read_only=True)
    mobiliario = MobiliarioField(write_only=True, required=False)

    class Meta:
        model = Degustacion
        fields = [
            'id', 'nombre', 'cantidad_personas', 'responsable', 'alimentos', 'estado',
            'fecha_degustacion', 'hora_degustacion', 'fecha_evento', 'mobiliario_asignado', 'mobiliario',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ('id', 'name', 'description', 'colors', 'image')


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'created_at', 'is_read']


class CalendarActivitySerializer(serializers.Serializer):
    title = serializers.CharField()
    start = serializers.DateTimeField()
    end = serializers.DateTimeField()
    type = serializers.CharField()
    details = serializers.DictField()

class HomeSectionImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeSectionImage
        fields = ['id', 'image', 'caption', 'order']

class HomeSectionSerializer(serializers.ModelSerializer):
    images = HomeSectionImageSerializer(many=True, read_only=True)

    class Meta:
        model = HomeSection
        fields = ['id', 'name', 'title', 'description', 'extra_text', 'images']