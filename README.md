# Sistema de Contratos — Victorino Eng

Gerador de contratos de licenciamento de software (SaaS) para a **Victorino Eng**.
Você preenche um formulário com os dados do cliente (PJ ou PF), o sistema monta o
contrato **com os dados da sua empresa já prontos** e gera um **link** para o cliente
**ler e assinar** de forma digital.

- 🧾 Formulário para **Pessoa Jurídica (CNPJ)** ou **Pessoa Física (CPF)**
- 🏢 Dados da Victorino Eng já embutidos (não precisa digitar toda vez)
- 🔗 Gera um **link único** por contrato para enviar ao cliente
- ✍️ Cliente **assina digitalmente** (desenho da assinatura + aceite com data/hora)
- 🖨️ Botão **Baixar PDF / Imprimir** (via impressão do navegador)
- ☁️ Banco de dados no **Firebase (Firestore)** · hospedagem gratuita no **GitHub Pages**

> **Alterações já aplicadas ao seu contrato original:**
> - Carência (fidelidade) passou de **6 meses → 1 ano (12 meses)** — Cláusula 6ª.
> - Reajuste da mensalidade agora é de **+50% a cada 12 meses** — Cláusula 3ª.

---

## 📁 Estrutura do projeto

```
index.html            → Painel: criar novo contrato (protegido por senha)
contratos.html        → Painel: lista de contratos e status de assinatura
contrato.html         → Página do cliente: ler + assinar (é o link enviado)
css/styles.css        → Estilos
js/firebase-config.js → 🔧 VOCÊ CONFIGURA AQUI (Firebase + senha do painel)
js/db.js              → Acesso ao banco (Firestore)
js/contract-template.js → Texto do contrato (dados da Victorino Eng fixos)
js/app.js             → Lógica do formulário
js/sign.js            → Visualização + assinatura
js/list.js            → Lógica da listagem
js/utils.js           → Máscaras, moeda e valor por extenso
firestore.rules       → Regras de segurança do banco
.nojekyll             → Faz o GitHub Pages servir os arquivos sem processar
RELATORIO.md          → Falatório / documentação do sistema
```

---

## 🚀 Como colocar no ar (passo a passo)

### 1) Criar o projeto no Firebase (banco de dados)

1. Acesse <https://console.firebase.google.com> e clique em **Adicionar projeto**.
2. Dê um nome (ex.: `contratos-victorino`) e conclua a criação.
3. No menu lateral: **Criação → Firestore Database → Criar banco de dados**.
   Escolha o modo **Produção** e a região (ex.: `southamerica-east1`).
4. Ainda no Firestore, abra a aba **Regras**, apague o conteúdo, cole o conteúdo
   do arquivo [`firestore.rules`](firestore.rules) deste projeto e clique em **Publicar**.
5. Volte para **Visão geral do projeto** → clique no ícone **Web `</>`** para
   registrar um app da web. Dê um apelido e finalize.
6. O Firebase mostrará um objeto **`firebaseConfig`**. **Copie esses valores.**

### 2) Configurar o sistema

Abra o arquivo [`js/firebase-config.js`](js/firebase-config.js) e:

- Cole os valores do `firebaseConfig` (apiKey, projectId, etc.).
- Troque a **senha do painel** em `ADMIN_SENHA` por uma senha sua.

### 3) Subir para o GitHub

Este repositório já é o do projeto. Depois de colar as chaves do Firebase, envie:

```bash
git add .
git commit -m "Configura Firebase do sistema de contratos"
git push
```

### 4) Deixar o repositório PÚBLICO

> O GitHub Pages **gratuito** só publica sites de repositórios **públicos**.

1. No GitHub, abra o repositório → **Settings** (Configurações).
2. Role até o final, em **Danger Zone** → **Change repository visibility** →
   **Change to public** → confirme.

### 5) Publicar no GitHub Pages

1. Ainda em **Settings**, no menu lateral clique em **Pages**.
2. Em **Build and deployment → Source**, escolha **Deploy from a branch**.
3. Em **Branch**, selecione a branch **`claude/contract-generator-system-tsi0g3`**
   (ou `main`, se você já tiver juntado o código lá) e a pasta **`/ (root)`**.
4. Clique em **Save**. Aguarde ~1 minuto.

O GitHub mostrará o link do seu site, algo como:
`https://SEU-USUARIO.github.io/contratos-assinado/`

Pronto! Seu sistema está no ar. 🎉

---

## 🧭 Como usar no dia a dia

1. Acesse `https://SEU-USUARIO.github.io/contratos-assinado/` → digite a **senha do painel**.
2. Escolha **PJ** ou **PF**, preencha os dados do cliente e os valores
   (setup, mensalidade, vencimento, data). Os dados da Victorino Eng já vêm prontos.
3. Clique em **Gerar contrato e criar link** → copie o link.
4. Envie o link ao cliente (WhatsApp, e-mail...). Ele abre, lê, **assina** e finaliza.
5. Em **Contratos**, você acompanha o status (**Pendente / Assinado**) e pode abrir
   qualquer contrato para **Baixar PDF / Imprimir** a via assinada.

> 💡 O botão **Pré-visualizar** mostra o contrato sem salvar — útil para conferir
> antes de enviar.

---

## 🔒 Segurança

Este sistema usa uma **senha no painel** (em `firebase-config.js`) como proteção
do dia a dia, e as [`firestore.rules`](firestore.rules) impedem que um cliente
altere cláusulas ou apague contratos — ele só consegue **ler** e **assinar** pelo link.

Para **segurança forte** (recomendado se for lidar com muitos clientes), ative o
**Firebase Authentication**:

1. No console do Firebase: **Criação → Authentication → Começar → E-mail/senha**.
2. Crie um usuário (seu e-mail e senha) na aba **Users**.
3. Troque, em `firestore.rules`, a linha `allow create: if true;` por
   `allow create: if request.auth != null;` e publique.
4. (Opcional) Adicione uma tela de login com e-mail/senha do Firebase no painel.

> A senha do painel é uma proteção **client-side**: bloqueia o uso casual, mas não
> substitui o Authentication para dados sensíveis. As páginas do painel usam
> `noindex` (não aparecem em buscadores) e o link do cliente só é acessível por
> quem tem o endereço do contrato — o que atende bem o uso interno.
>
> ⚠️ Como o repositório ficará **público**, qualquer pessoa poderá **ler o código**
> (isso é normal em sites estáticos). Nunca coloque senhas de verdade de sistemas
> importantes no `firebase-config.js`; a `apiKey` do Firebase pode ser pública
> (ela não dá acesso aos dados — quem protege os dados são as `firestore.rules`).
> Para segurança real, ative o **Firebase Authentication** conforme abaixo.

---

## ❓ Perguntas frequentes

**Preciso saber programar?** Não. Só preencher o `firebase-config.js` e seguir os passos.

**Funciona sem o Firebase?** O gerador e a impressão funcionam, mas o **link de
assinatura** e a **lista de contratos** precisam do Firebase configurado.

**Como troco os dados da minha empresa?** Edite a constante `CONTRATADA` no arquivo
[`js/contract-template.js`](js/contract-template.js).

**A assinatura digital tem validade?** O sistema registra a assinatura desenhada,
o nome, o aceite e a data/hora — dentro do conceito de assinatura eletrônica
(art. 10, §2º da MP 2.200-2/2001). Para atos que exijam assinatura com certificado
ICP-Brasil, use uma plataforma credenciada em conjunto.
