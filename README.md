# Toodooist 📝

Uma aplicação elegante de gerenciamento de post-its construída com React e Vite, inspirada na frase icônica do Doctor Who: *"Dalek: But you have no weapons, no defenses, no plan"*.

## ✨ Funcionalidades

- **Criação de Post-its**: Crie notas coloridas com até 40 caracteres
- **7 Cores Disponíveis**: Paleta de cores pastel para organizar suas notas
- **Datas Opcionais**: Adicione datas aos seus post-its
- **Arrastar para Deletar**: Arraste os post-its para a direita para deletá-los
- **Armazenamento Local**: Suas notas são salvas automaticamente no navegador
- **Design Responsivo**: Funciona perfeitamente em desktop e mobile
- **Fonte Elegante**: Tipografia "Satisfy" do Google Fonts

## 🚀 Como Usar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm

### Instalação
```bash
# Clone o repositório
git clone https://github.com/willianszwy/toodooist.git

# Entre no diretório
cd toodooist

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Visualiza build de produção
npm run lint     # Executa ESLint
npm run deploy   # Deploy para GitHub Pages
```

## 🏗️ Tecnologias

- **React 19** - Interface de usuário
- **Vite** - Build tool e dev server
- **CSS Puro** - Estilização com CSS Variables
- **ESLint** - Linting e qualidade de código
- **GitHub Pages** - Deploy automático

## 📱 Como Funciona

1. **Criar Post-it**: Clique no botão "+" para abrir o modal
2. **Preencher Dados**: Digite a descrição (máx. 40 chars) e data opcional
3. **Escolher Cor**: Selecione uma das 7 cores disponíveis
4. **Salvar**: Clique em "Criar Post-it" - será salvo automaticamente
5. **Deletar**: Arraste o post-it para a direita até ele desaparecer

## 🎨 Design System

### Cores dos Post-its
- 🟤 `#D6A99D` - Marrom rosado (padrão)
- 🟡 `#FBF3D5` - Amarelo claro
- 🟢 `#D6DAC8` - Verde suave
- 🔵 `#ADB2D4` - Azul lavanda
- 🩵 `#C7D9DD` - Azul céu
- 🟢 `#D5E5D5` - Verde menta
- 🟡 `#EEF1DA` - Lima claro

### Funcionalidades de UX
- Contador de caracteres em tempo real
- Validação de formulário
- Animações suaves de hover e drag
- Modal com ESC para fechar
- Feedback visual durante drag-to-delete

## 🔧 Arquitetura

```
src/
├── App.jsx          # Componente principal com toda lógica
├── main.jsx         # Entry point da aplicação
└── assets/          # Recursos estáticos

styles.css           # Estilos globais
index.html          # Template HTML
vite.config.js      # Configuração do Vite
```

## 📊 Modelo de Dados

```javascript
{
  id: timestamp + random,           // ID único
  description: string,              // Máx. 40 caracteres
  date: ISO string | null,          // Data opcional
  color: hex string,                // Cor selecionada
  createdAt: ISO string             // Data de criação
}
```

## 🌐 Deploy

A aplicação está configurada para deploy automático no GitHub Pages:

```bash
npm run deploy
```

Acesse: [https://willianszwy.github.io/toodooist/](https://willianszwy.github.io/toodooist/)

## 🧪 Desenvolvimento

O projeto utiliza:
- **ESLint** com configuração moderna (flat config)
- **React Hooks** (useState, useEffect, useCallback)
- **CSS Variables** para theming consistente
- **Drag API** customizada para mobile e desktop
- **LocalStorage** com tratamento de erros

## 📝 Licença

Este projeto é open source. Sinta-se livre para usar, modificar e distribuir.

---

*"The way I see it, every life is a pile of good things and bad things. The good things don't always soften the bad things, but vice versa, the bad things don't always spoil the good things and make them unimportant."* - The Doctor