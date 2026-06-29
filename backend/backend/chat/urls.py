from django.urls import path
from .views import AssistantChatView, ConversationListCreateView, ConversationDetailView, MessageListCreateView

urlpatterns = [
    path('assistant/', AssistantChatView.as_view(), name='assistant-chat'),
    path('conversations/', ConversationListCreateView.as_view(), name='conversation-list'),
    path('conversations/<int:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:conversation_id>/messages/', MessageListCreateView.as_view(), name='message-list'),
]
