# 📋 Falatório do Sistema — Gerador de Contratos Victorino Eng

Documento explicativo de tudo que foi construído: o que o sistema faz, como funciona,
quais decisões foram tomadas e o que você precisa fazer para usá-lo.

---

## 1. O que o sistema faz

Um sistema web que gera contratos de licenciamento SaaS, com **dois lados**:

- **Cliente** (link público, sem senha): preenche apenas a identificação dele
  (Pessoa Jurídica ou Pessoa Física) e o endereço. Vê os valores do contrato
  **somente para leitura**. Ao enviar, os dados vão para o Firebase.
- **Admin / você** (login seguro): define os valores padrão, recebe os dados dos
  clientes, ajusta valores por contrato se precisar e **gera o PDF** pronto.

Os dados da **Victorino Eng** e os **valores** ficam guardados no **Firebase** e só
você (logado) pode alterá-los.

---

## 2. Segurança (o ponto central desta versão)

| Camada | Como protege |
|-------|--------------|
| **Firebase Authentication** | Só entra no painel quem tem e-mail/senha cadastrados. Nada de senha no código. |
| **Regras do Firestore** | O cliente só cria o próprio registro e **com os valores iguais aos que você definiu**. Ler/editar/excluir: só admin. |
| **Config no Firebase** | Empresa e valores ficam no banco, editáveis só por você. |
| **noindex + repositório** | Páginas fora de buscadores; código público não expõe segredos (a apiKey do Firebase pode ser pública). |

**Por que a apiKey pode ser pública?** No Firebase para web, a apiKey apenas
identifica o projeto — ela não dá acesso aos dados. Quem controla o acesso são o
Authentication e as regras do Firestore. Por isso o repositório pode ficar público
sem risco.

---

## 3. As alterações no contrato (em relação ao original)

- **Cláusula 6.1** → fidelidade de **1 ano (12 meses)** (era 6 meses).
- **Cláusula 6.2** → multa até a finalização do **12º mês**.
- **Cláusula 3.3** → reajuste de **+50% a cada 12 meses**.
- **Removido**: campo de **testemunhas**.
- **Removido**: assinatura pelo sistema — agora você **gera o PDF** e a assinatura é
  feita fora (impressa ou por outra ferramenta).

Todas essas regras (carência e reajuste) são **configuráveis** no painel, em
Configurações — hoje já vêm com 12 meses e 50%.

---

## 4. Fluxo de uso

```
[Você, 1x] Login -> Configurações -> Salvar (grava empresa + valores no Firebase)
        |
        v
[Você] Início -> copia o LINK DO CLIENTE -> envia ao cliente
        |
        v
[Cliente] abre o link (sem senha) -> preenche os dados dele
          -> vê os valores (só leitura) -> Enviar
        |
        v
[Firebase] guarda o contrato (status "pendente"), com os valores travados = config
        |
        v
[Você] Contratos -> abre o contrato -> ajusta valores/data se precisar -> Salvar
       -> Baixar PDF / Imprimir -> envia ao cliente para assinar
```

---

## 5. Como foi construído (arquitetura)

Site **estático** (HTML + CSS + JavaScript puro, sem build), hospedado no
**GitHub Pages**, usando **Firebase** (Authentication + Firestore).

**Páginas admin** (protegidas por login):
- `index.html` — login e início (mostra o link do cliente).
- `configuracoes.html` — dados da empresa + valores padrão.
- `contratos.html` — lista dos contratos recebidos.
- `contrato.html` — um contrato: editar valores e gerar PDF.

**Página pública:**
- `cliente.html` — o formulário que o cliente preenche.

**Núcleo (JavaScript):**
- `db.js` — conversa com o Firebase (login, config, contratos). O SDK é carregado
  sob demanda, então a página não quebra se algo falhar.
- `contract-template.js` — monta o texto do contrato; empresa e valores vêm do
  Firebase; contém as cláusulas e as suas alterações.
- `utils.js` — máscaras (CNPJ/CPF/CEP), formatação de dinheiro e número por extenso.
- `cliente.js`, `config.js`, `list.js`, `contrato-admin.js`, `app.js` — a lógica de
  cada tela.

---

## 6. Modelo de dados (Firestore)

**`config/contrato`** (um documento, só admin edita):
```
empresa { razaoSocial, cnpj, endereco, site, repNome, repCargo, repCpf }
objeto, valorSetup, valorMensalidade, diaVencimento,
cidadeAssinatura, ufAssinatura, foroComarca,
fidelidadeMeses (12), reajustePercent (50)
```

**`contratos/{id}`** (um por cliente):
```
id, status ("pendente" | "revisado"), createdAt,
tipoCliente ("PJ" | "PF"),
razaoSocial, cnpj, repNome, repRg, repCpf,        (quando PJ)
nome, cpf, rg, nacionalidade, estadoCivil, profissao,  (quando PF)
endereco { logradouro, numero, complemento, bairro, cidade, uf, cep },
objeto, valorSetup, valorMensalidade, diaVencimento,   (cópia travada do config)
cidadeAssinatura, ufAssinatura, fidelidadeMeses, reajustePercent,
dataAssinatura   (definida por você ao gerar o PDF)
```

---

## 7. O que foi testado

- ✅ Geração do contrato (PJ e PF), com empresa e valores corretos.
- ✅ Alterações: fidelidade 1 ano, reajuste 50%, multa 12º mês, sem testemunhas.
- ✅ Formulário do cliente ponta a ponta (com Firebase simulado): preenche, vê os
  valores em leitura, envia — e **os valores enviados são idênticos aos do config**
  (cliente não consegue alterar).
- ✅ Tela admin: edição de valores com **pré-visualização ao vivo**, salvar e gerar PDF.
- ✅ Todas as páginas carregam sem erros de código.
- ✅ Layout do contrato conferido visualmente.

> Observação: os testes com o Firebase **ao vivo** (login real e gravação) rodam no
> GitHub Pages, que tem internet liberada — o ambiente de desenvolvimento não acessa
> a CDN do Firebase, então essa parte foi validada com um Firebase simulado.

---

## 8. O que falta você fazer (uma vez, sem programar)

1. **Ativar o login**: Firebase → Authentication → E-mail/senha → criar seu usuário.
2. **Publicar as regras**: Firestore → Regras → colar `firestore.rules` → Publicar.
3. **Primeiro acesso**: logar no painel → Configurações → **Salvar**.

Passo a passo detalhado no **[README.md](README.md)**.

---

## 9. Ideias para o futuro (opcional)

- Assinatura eletrônica do cliente com validade (integração com plataforma ICP/■).
- Envio automático do link/PDF por e-mail ou WhatsApp.
- Numeração sequencial de contratos e exportação em lote.
- Logotipo da Victorino Eng no cabeçalho do PDF.
- Filtro/busca na lista de contratos.

---

*Sistema desenvolvido para a Victorino Eng — seguro, com dados no Firebase e pronto para uso.*
