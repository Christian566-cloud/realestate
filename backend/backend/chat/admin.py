from django.contrib import admin
from .models import Conversation, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 1
    readonly_fields = ('created_at',)


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'property', 'participant_count', 'created_at')
    list_filter = ('created_at', 'property__city')
    search_fields = ('participants__email', 'participants__username', 'property__title')
    filter_horizontal = ('participants',)
    autocomplete_fields = ['property']
    inlines = [MessageInline]

    @admin.display(description='Participants')
    def participant_count(self, obj):
        return obj.participants.count()


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'sender', 'content_preview', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('content', 'sender__email')
    autocomplete_fields = ['conversation', 'sender']
    list_editable = ('is_read',)

    @admin.display(description='Content')
    def content_preview(self, obj):
        return obj.content[:80] + '...' if len(obj.content) > 80 else obj.content
