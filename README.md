# Sistema de Contratos — Victorino Eng

Gerador de contratos de licenciamento de software (SaaS) para a **Victorino Eng**.

Funciona em dois lados:

- 👤 **Cliente** (link público, **sem senha**): preenche só os dados dele (PJ ou PF).
  Os valores do contrato aparecem **apenas para leitura** — ele não consegue alterá-los.
- 🔐 **Você (admin)** (login seguro): define os valores, revisa os dados enviados,
  ajusta se precisar e **gera o PDF** do contrato.

### Segurança (o que mantém tudo protegido)

- **Login de verdade** com **Firebase Authentication** (nada de senha escrita no código).
- **Valores e dados da empresa ficam no Firebase**, e só você (logado) pode editá-los.
- **Regras do Firestore** garantem que o cliente só consegue *enviar os próprios dados*
  com os valores exatamente iguais aos que você definiu — sem mexer em preço, carência, etc.

> **Alterações já embutidas no contrato:**
> - Carência (fidelidade): **1 ano (12 meses)** — Cláusula 6ª.
> - Reajuste da mensalidade: **+50% a cada 12 meses** — Cláusula 3ª.
> - **Sem campo de testemunhas** e **sem assinatura pelo sistema** (você gera o PDF).

---

## 📁 Estrutura do projeto

```
index.html            → Painel admin: login + início (link do cliente)
configuracoes.html    → Admin: dados da empresa + valores padrão (salvos no Firebase)
contratos.html        → Admin: lista de contratos enviados pelos clientes
contrato.html         → Admin: revisar 1 contrato, ajustar valores e gerar PDF
cliente.html          → PÚBLICO: formulário que o cliente preenche (sem senha)
css/styles.css        → Estilos (identidade visual da marca)
img/                  → Logos da Victorino Eng (horizontal e principal)
js/firebase-config.js → Chaves do Firebase (já preenchidas)
js/db.js              → Auth + Firestore (config e contratos)
js/contract-template.js → Texto do contrato (empresa/valores vêm do Firebase)
js/app.js             → Login + dashboard (index)
js/config.js          → Tela de configurações
js/cliente.js         → Formulário do cliente
js/list.js            → Lista de contratos
js/contrato-admin.js  → Tela de um contrato (editar valores + PDF)
js/utils.js           → Máscaras, moeda e número por extenso
firestore.rules       → Regras de segurança do banco
.nojekyll             → Faz o GitHub Pages servir os arquivos sem processar
RELATORIO.md          → Falatório / documentação do sistema
```

---

## 🚀 Configuração (você faz uma vez)

As chaves do Firebase **já estão no código**. Faltam 3 ajustes rápidos no console
do Firebase e 1 primeiro acesso.

### 1) Ativar o login (Firebase Authentication)

1. Acesse <https://console.firebase.google.com> → projeto **gerador-de-contratos**.
2. Menu **Criação → Authentication → Começar**.
3. Aba **Sign-in method** → ative **E-mail/senha** → Salvar.
4. Aba **Users → Adicionar usuário** → coloque **seu e-mail e uma senha**.
   *(É com esse e-mail e senha que você vai entrar no painel.)*

### 2) Publicar as regras de segurança (Firestore)

1. Menu **Criação → Firestore Database → Criar banco de dados** (modo **Produção**,
   região `southamerica-east1`), caso ainda não exista.
2. Aba **Regras** → apague tudo → cole o conteúdo do arquivo
   [`firestore.rules`](firestore.rules) → **Publicar**.

### 3) Primeiro acesso ao painel

1. Abra `https://SEU-USUARIO.github.io/contratos-assinado/` e faça **login**.
2. Vá em **Configurações** → confira os dados da empresa e os valores
   (já vêm preenchidos com os da Victorino Eng) → clique em **💾 Salvar**.
   *(Isso grava a configuração no Firebase. Sem esse passo, o formulário do
   cliente fica indisponível.)*

Pronto! O sistema está no ar e seguro. 🎉

---

## 🧭 Como usar no dia a dia

1. Na tela **Início** do painel, copie o **link do cliente** e envie para ele.
2. O cliente abre o link (sem senha), preenche os dados dele e clica em **Enviar**.
3. Você entra no painel → **Contratos** → abre o contrato recebido.
4. Ajusta os valores se precisar, define a data, clica em **💾 Salvar** e depois em
   **🖨 Baixar PDF / Imprimir** (no diálogo de impressão escolha "Salvar como PDF").
5. Envie o PDF para o cliente assinar (impresso ou por outra ferramenta de assinatura).

---

## 🔒 Observações de segurança

- As chaves do Firebase no código **podem ser públicas** — elas só identificam o
  projeto. Quem protege os dados é o **login** + as **regras do Firestore**.
- Só quem tem **e-mail e senha cadastrados no Authentication** entra no painel e
  edita valores/contratos. O cliente nunca vê o painel.
- As páginas usam `noindex` (não aparecem no Google). O link do cliente é o mesmo
  para todos; cada envio cria um registro separado no Firebase.
- Para dar acesso a outra pessoa da sua equipe, basta criar outro usuário no
  Firebase Authentication.

---

## ❓ Perguntas frequentes

**Esqueci a senha do painel.** No console do Firebase → Authentication → Users, você
pode redefinir a senha do usuário.

**Como mudo os valores padrão (setup, mensalidade, carência, reajuste)?**
No painel, em **Configurações**. Fica tudo salvo no Firebase.

**Como mudo os dados da minha empresa?** Também em **Configurações**.

**O cliente consegue burlar e mudar o preço?** Não. As regras do Firestore rejeitam
qualquer envio cujos valores sejam diferentes dos que você configurou.

**Preciso pagar algo?** Não para o uso normal: GitHub Pages e o plano gratuito do
Firebase (Spark) atendem bem esse volume.
